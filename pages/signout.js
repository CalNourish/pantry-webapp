import { useUser } from '../context/userContext'

export default function SignOut() {

    const { logout } = useUser();
    if(typeof window !=="undefined") {
        window.onload = logout()
    }

    return null;
}