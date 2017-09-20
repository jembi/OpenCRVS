/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-09-19 12:27:41
 */
import React from 'react';
import styles from './styles.css';
import Dialog from 'react-toolbox/lib/dialog';
import { Button } from 'react-toolbox/lib/button';

class CertCheckModal extends React.Component {
  constructor(props) {
    super(props);
  }
  
  closeCertCheckModal = (event) => {
    this.props.onModalCloseClick('certCheck');
  }
  
  rejectCert = (event) => {
    this.props.onModalCloseClick('certCheck');
  }

  printCert = (event) => {
    this.props.onPrintProceed();
    this.props.onModalCloseClick('certCheck');
  }

  render = () => {
    const { 
      certIDCheckModal, 
       } = this.props;
    const dialogueActions = [
      { label: 'Close', onClick: this.closeCertCheckModal },
    ];
    return (
      <Dialog
        actions={dialogueActions}
        active={certIDCheckModal}
        onEscKeyDown={this.closeCertCheckModal}
        title="Check Certification"
      >

      <section className={styles.detailsSection}>
        <h1 className={ styles.submitConfirmHeader }>Enter details form as per ticket OCRVS-109.</h1>
        <p>Grey out print and reject buttons until form successfully completed.</p>
        <Button icon="print" label="Print" flat onClick={this.printCert} />
        <Button icon="cancel" label="Reject" flat onClick={this.rejectCert} />
      </section>

      </Dialog>
    );
  }
}

export default CertCheckModal;

