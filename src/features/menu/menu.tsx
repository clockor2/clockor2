import { Modal, Navbar } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { DarkThemeToggle } from 'flowbite-react';
import { useDarkMode } from "../utils/darkmode";
import { is } from "immer/dist/internal";

export function Menu(){
  const [openModal, setOpenModal] = useState<string | undefined>();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const isDarkMode = useDarkMode();
  
  useEffect(() => {
    const beforeInstallPromptListener = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', beforeInstallPromptListener);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptListener);
    };
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;

    // Show the prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice
      .then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
      });
  };

  const showInstall = () =>  {
    if (deferredPrompt) {
      return (
        <Navbar.Link className="text-white cursor-pointer dark:text-slate-300"  onClick={handleInstallClick}>
          Install 
        </Navbar.Link>
      )
      }
  }


  const renderLogo = () => {
    
    return (
      <img
        src={isDarkMode ? '/logo-dark.png' : '/logo.png'}
        className="mr-1 h-8"
        alt="Clockor2 Logo"
      />
    )
  }

  return (
      <div>
        <Navbar
          fluid={true}
          rounded={false}
          className="!bg-slate-700 "
        >
          <Navbar.Brand href="/">
            {renderLogo()}
            <div className="whitespace-nowrap font-semibold text-white dark:text-slate-300 ">
              <span className="text-2xl">
                Clockor2
              </span>
              <span className="text-sm pl-1">
                v{__VERSION__}
              </span>
            </div>
          </Navbar.Brand>
          <div className="flex flex-grow justify-end">
            <DarkThemeToggle className="mr-4" />
          </div>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Navbar.Link className="text-white dark:text-slate-300 cursor-pointer"  onClick={() => setOpenModal('default')}  >
              About
            </Navbar.Link >
            <Navbar.Link className="text-white dark:text-slate-300"  target="_blank" href="https://clockor2.github.io/docs">
              Docs 
            </Navbar.Link >
            {showInstall()}
            <Navbar.Link className="text-white dark:text-slate-300"  target="_blank" href="https://doi.org/10.1093/sysbio/syae003">
              Citation
            </Navbar.Link>
            <Navbar.Link className="text-white dark:text-slate-300"  target="_blank" href="https://github.com/clockor2/clockor2">
              Code
            </Navbar.Link>
            <Navbar.Link className="text-white dark:text-slate-300"  target="_blank" href="https://github.com/clockor2/clockor2/issues/new/choose">
              Report Bug
            </Navbar.Link>
          </Navbar.Collapse>
        </Navbar>
        
        <React.Fragment>
          <Modal
            dismissible={true}
            show={openModal === 'default'}
            onClose={() => setOpenModal(undefined)}
          >
            <Modal.Header>
              About
            </Modal.Header>
            <Modal.Body>
              <div className="space-y-6 dark:text-slate-400">
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