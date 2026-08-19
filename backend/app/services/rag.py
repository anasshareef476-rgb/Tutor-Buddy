import os
import chromadb
from app.core.config import settings
from google import genai
from langchain_text_splitters import RecursiveCharacterTextSplitter
from PyPDF2 import PdfReader
import io

# Initialize ChromaDB client (local persistent storage)
# We store the vector DB inside the backend directory for now
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "chroma_db")
chroma_client = chromadb.PersistentClient(path=DB_PATH)

# Using a standard collection for documents
collection = chroma_client.get_or_create_collection(name="course_documents")

def get_genai_client():
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set")
    return genai.Client(api_key=settings.GEMINI_API_KEY)

def generate_embedding(text: str) -> list[float]:
    """Generate an embedding for a text chunk using Gemini gemini-embedding-2"""
    client = get_genai_client()
    result = client.models.embed_content(
        model="gemini-embedding-2",
        contents=text
    )
    return result.embeddings[0].values

def extract_text(file_bytes: bytes, filename: str) -> str:
    """Extract text from supported file types"""
    text = ""
    if filename.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(file_bytes))
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    elif filename.endswith(".txt") or filename.endswith(".md"):
        text = file_bytes.decode("utf-8", errors="ignore")
    else:
        raise ValueError("Unsupported file type. Only PDF and TXT/MD are currently supported.")
    return text

def process_and_store_document(file_bytes: bytes, filename: str, user_id: int):
    """Parse, chunk, and embed a document, storing it in ChromaDB"""
    # 1. Extract text
    raw_text = extract_text(file_bytes, filename)
    if not raw_text.strip():
        raise ValueError("No text could be extracted from the file.")
        
    # 2. Chunk text
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    chunks = text_splitter.split_text(raw_text)
    
    # 3. Generate embeddings and store
    ids = []
    embeddings = []
    metadatas = []
    documents = []
    
    for i, chunk in enumerate(chunks):
        chunk_id = f"{user_id}_{filename}_chunk_{i}"
        embedding = generate_embedding(chunk)
        
        ids.append(chunk_id)
        embeddings.append(embedding)
        metadatas.append({"filename": filename, "user_id": user_id, "chunk_index": i})
        documents.append(chunk)
        
    # Upsert to ChromaDB
    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        metadatas=metadatas,
        documents=documents
    )
    
    return len(chunks)

def retrieve_context(query: str, user_id: int, top_k: int = 3) -> str:
    """Retrieve top k relevant document chunks for a query"""
    try:
        query_embedding = generate_embedding(query)
        
        # Filter by user_id to ensure users only retrieve their own documents
        # Note: In a broader scope, you might want global documents, but filtering by user is safer.
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where={"user_id": user_id}
        )
        
        if not results['documents'] or not results['documents'][0]:
            return ""
            
        context_chunks = []
        for i, doc in enumerate(results['documents'][0]):
            filename = results['metadatas'][0][i].get('filename', 'Unknown Source')
            context_chunks.append(f"--- Document Source: {filename} ---\n{doc}\n")
            
        return "\n".join(context_chunks)
    except Exception as e:
        print(f"RAG Retrieval Error: {e}")
        return ""
