/**
 * This route receives the Google ID Token from a POST req, 
 * and sends it along to the '/signin' page where sign-in is completed.
 */
export default (req, res) => {
    try {
        const { credential: idToken } = req.body
        const redirectURI = process.env.LOGIN_REDIRECT_URI
        const params = new URLSearchParams()
        params.set('from', req.url)
        params.set('idToken', idToken)
        return res.redirect(`${redirectURI}?${params}`)
    } catch (error) {
        console.error('problem signing in: ', error.message)
    }
};
