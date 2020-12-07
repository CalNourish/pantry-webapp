

export default function ModalContent(close) {
    return (
        <div className="modal-wrapper">
             <div className="modal-header">
                <p>Hello I'm a modal</p>
            </div>
            <div className="modal-content">
                <div className="modal-body">
                    <h4>Modal</h4>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                </div>
                <div>
                    <form>
                        <div>
                            <label>First Name</label>
                            <input type="text" name="firstName" required />
                            <label>Last Name</label>
                            <input type="text" name="lastName" required />
                        </div>
                        <div>
                            <label>Email Address</label>
                            <input type="email" name="email" required />
                        </div>
                        <div>
                            <label>Password</label>
                            <input type="password" name="password1"/>
                        </div>
                        <div>
                            <label>Re-enter Password</label>
                            <input type="password" name="password2"/>
                        </div>
                        <button type="submit">Sign Up</button>
                    </form> 
                </div>
            </div>
        </div>
    )
  }