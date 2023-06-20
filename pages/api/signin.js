import { server } from "../_app";

/**
 * This route receives the Google ID Token from a POST req, 
 * and sends it along to the '/signin' page where sign-in is completed.
 */
export default (req, res) => {
    try {
        const { credential: idToken } = req.body
        const params = new URLSearchParams()
        params.set('from', req.url)
        params.set('idToken', idToken)
        const redirectURI = `${server}/signin?${params}`
        return res.redirect(redirectURI)
    } catch (error) {
        console.error('problem signing in: ', error.message)
    }
};
