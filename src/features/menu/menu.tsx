import { Modal, Navbar } from "flowbite-react";
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
          rounded={false}
          className="!bg-slate-700 "
        >
          <Navbar.Brand href="/">
            <img
              src="logo.svg"
              className="mr-1 h-8"
              alt="Clockor2 Logo"
            />
            <span className="self-center whitespace-nowrap text-2xl font-semibold text-white dark:text-white">
              Clockor2
            </span>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse >
            <Navbar.Link className="!text-white cursor-pointer"  onClick={toggleModal} >
              About
            </Navbar.Link >
            <Navbar.Link className="!text-white"  href="/">
              Docs 
            </Navbar.Link>
            <Navbar.Link className="!text-white"  href="/">
              Citation
            </Navbar.Link>
            <Navbar.Link className="!text-white"  href="https://github.com/clockor2/clockor2">
              Code
            </Navbar.Link>
            <Navbar.Link className="!text-white"  href="/">
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
              About
            </Modal.Header>
            <Modal.Body>
              <div className="space-y-6">
                <p>
                  Clockor2 is a client-side web application for conducting root-to-tip (RTT) regression - the fastest and most widely used method to calibrate strict molecular clocks. 
                </p>
                <p>
                  Clockor2 also uniquely allows users to quickly fit local molecular clocks using RTT regression, thus handling the increasing complexity of phylodynamic datasets that sample beyond the assumption homogeneous host populations into other postulations and species. Clockor2 is efficient, handling trees of up to 10^5 tips, with significant speed increases compared to other RTT regression applications. 
                </p>
                <p>
                  Although clockor2 is written as a web application, all data processing happens on the client-side, meaning that data never leaves the user’s computer.
                </p>
              </div>
            </Modal.Body>
          </Modal>
        </React.Fragment>
      </div>
        
    )
}