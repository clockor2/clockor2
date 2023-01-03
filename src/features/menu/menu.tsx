import { Button, Modal, Navbar } from "flowbite-react";
import React, { useState } from "react";


export function Menu(){
  const [isToggled,setToggle] = useState(false);
    const toggleModal = () => {
      setToggle(!isToggled)
    }
    return (
      <div>
        <Navbar
          fluid={true}
          rounded={true}
        >
          <Navbar.Brand href="/">
            <img
              src="/android-chrome-512x512.png"
              className="mr-3 h-6 sm:h-9"
              alt="Clockor2 Logo"
            />
            <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
              Clockor2
            </span>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Navbar.Link onClick={toggleModal} >
              About
            </Navbar.Link>
            <Navbar.Link href="/">
              Docs 
            </Navbar.Link>
            <Navbar.Link href="/">
              Citation
            </Navbar.Link>
            <Navbar.Link href="https://github.com/clockor2/clockor2">
              Code
            </Navbar.Link>
            <Navbar.Link href="/">
              Contact
            </Navbar.Link>
          </Navbar.Collapse>
        </Navbar>
        
        <React.Fragment>
          <Modal
            show={isToggled}
            onClose={toggleModal}
          >
            <Modal.Header>
              Terms of Service
            </Modal.Header>
            <Modal.Body>
              <div className="space-y-6">
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.
                </p>
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to notify users as soon as possible of high-risk data breaches that could personally affect them.
                </p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={toggleModal} >
                I accept
              </Button>
              <Button
                color="gray"
                onClick={toggleModal}
              >
                Decline
              </Button>
            </Modal.Footer>
          </Modal>
        </React.Fragment>
      </div>
        
    )
}