import React from 'react';
import classnames from 'classnames';
import QrSigner from '@parity/qr-signer';
import translate from 'translations';


class ParityQrSigner extends React.PureComponent {
    
  state = {
    webcamError: null,
    isLoading: true
  };

  componentDidMount() {
    this.checkForWebcam();
    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', this.checkForWebcam);
    }
  }

  componentWillUnmount() {
    if (navigator.mediaDevices && navigator.mediaDevices.ondevicechange) {
      navigator.mediaDevices.removeEventListener('devicechange', this.checkForWebcam);
    }
  }

  checkForWebcam = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        this.setState({
          webcamError: null,
          isLoading: false
        });
      } catch (err) {
        let errorMessage;
        switch (err.name) {
          case 'NotAllowedError':
          case 'SecurityError':
            errorMessage = translate('ADD_PARITY_ERROR_DISABLED');
            break;
          case 'NotFoundError':
          case 'OverconstrainedError':
            errorMessage = translate('ADD_PARITY_ERROR_NO_CAM');
            break;
          default:
            errorMessage = translate('ADD_PARITY_ERROR_UNKNOWN');
        }
        this.setState({
          webcamError: errorMessage,
          isLoading: false
        });
      }
    }
  };

  render() {
    const { webcamError, isLoading } = this.state;
    const size = this.props.size || 300;

    return (
      <div
        className={classnames({
          ParityQrSigner: true,
          'is-disabled': !!webcamError || isLoading
        })}
        style={{
          width: size,
          height: size
        }}
      >
        <div className="ParityQrSigner-error">
        <i className="ParityQrSigner-error-icon fa fa-exclamation-circle" />
        {webcamError}
        </div>
        <QrSigner {...this.props} size={size} />
      </div>
    );
  }
}

export default ParityQrSigner;