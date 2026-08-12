export const setToken = (token: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('tb_access_token', token)
}

export const getToken = () => {
    if (typeof window !== 'undefined') return localStorage.getItem('tb_access_token')
    return null
}

export const logout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('tb_access_token')
        window.location.href = '/login'
    }
}
