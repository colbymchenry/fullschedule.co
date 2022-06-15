import {Button} from "rsuite";
import React from "react";

const styles = {
    body: {
        fontFamily: 'Roboto, Open Sans, sans-serif',
        fontSize: '16px',
    },
    input: {
        fontSize: '13px',
        border: '1px solid #aaa',
        height: '50px',
        borderRadius: '10px',
        padding: '8px'
    },
    img: {
        right: '10px !important',
        top: '10px !important',
    },
    ".hydrated > div": {
        padding: "2px"
    }
};

class IFrameApp extends React.Component {
    constructor(props) {
        super(props);
        const elements = window.clover.elements();

        this.state = {
            token: null,
            output: [],
            showUserInfo: false,
            customerId: '',
            processing: false,
            user: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'John.Doe@corona.com'
            },
            card_expiry: '04/2022',
            card: {
                number: '4005562231212123',
                brand: 'VISA',
                cvv: '123',
                exp_month: '04',
                exp_year: '2022'
            },
        };
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.cardNumber = elements.create('CARD_NUMBER', styles);
        this.cardDate = elements.create('CARD_DATE', styles);
        this.cardCvv = elements.create('CARD_CVV', styles);
        this.cardPostalCode = elements.create('CARD_POSTAL_CODE', styles);

        if (window.clover && !window.elements) {
            window.elements = window.clover.elements();
        }
    }

    componentDidMount() {
        const displayError = document.getElementById('card-errors');
        this.cardNumber.mount('#card-number');
        this.cardDate.mount('#card-date');
        this.cardCvv.mount('#card-cvv');
        this.cardPostalCode.mount('#card-postal-code');

        try {
            this.cardNumber.addEventListener('change', (event) => {
                displayError.textContent = event.error ? event.error.message : '';
            });
        } catch (e) {

        }
        try {
            this.cardDate.addEventListener('change', (event) => {
                displayError.textContent = event.error ? event.error.message : '';
            });
        } catch (e) {

        }
        try {
            this.cardCvv.addEventListener('change', (event) => {
                displayError.textContent = event.error ? event.error.message : '';
            });
        } catch (e) {

        }
        try {
            this.cardPostalCode.addEventListener('change', (event) => {
                displayError.textContent = event.error ? event.error.message : '';
            });
        } catch (e) {

        }




        const cloverFooter = document.getElementsByClassName('clover-footer')[0];
        if (cloverFooter){
            cloverFooter.style.display = "none";
        }
    }

    generateMask(cardLast4) {
        return cardLast4.padStart(16, '*');
    }

    callCreateChargeAPI = async (response) => {
        this.setState({ processing: false })
        const source = response.token;
        const card = response.card;
        this.props.outputHandler(`Charging Card '${this.generateMask(card.last4)}' for $${this.props.amount}...`);
        this.props.callback(response);
    };

    handleFormSubmit(event) {
        event.preventDefault();
        this.setState({ processing: true })
        this.props.outputHandler(null, true);

        const displayError = document.getElementById('card-errors');

        this.props.outputHandler('Genarating Token (Using Encrypted Pan) ...');

        console.log('Genarating Token (Using Encrypted Pan) ...');
        window.clover.createToken()
            .then((result) => {
                if (result.errors) {
                    Object.values(result.errors).forEach(function (value) {
                        displayError.textContent = value;
                    });
                } else {
                    this.props.outputHandler(`Token Id is -> ${result.token}`);
                }
                return result;
            })
            .then((resp) => this.callCreateChargeAPI(resp))
            .catch(err => console.log(err));
    }
    componentWillUnmount(){
        const cloverFooter = document.getElementsByClassName('clover-footer')[0];
        cloverFooter && cloverFooter.parentNode.removeChild(cloverFooter);
    }
    render() {
        return (
            <>
                <div className="App" id="iframeapp">
                    <div id="card-errors" role="alert"/>
                    <div className="d-flex justify-content-center mt-16 flex-column">
                        <form id="payment-form" noValidate autoComplete="off">
                            <fieldset className="FormGroup">
                                <div className="FormRow">
                                    <div id="card-number" className="field card-number" style={{ maxHeight: "70px" }} />
                                </div>

                                <div className="FormRow">
                                    <div id="card-date" className="field third-width" style={{ maxHeight: "70px" }}/>
                                    <div id="card-cvv" className="field third-width" style={{ maxHeight: "70px" }}/>
                                    <div id="card-postal-code" className="field third-width" style={{ maxHeight: "70px" }} />
                                </div>
                            </fieldset>
                        </form>

                        <div className="d-flex flex-column justify-content-between" style={{ gap: "1rem" }}>
                            {/*<button type="button" className={`btn btn-secondary`} onClick={() => this.props.backHandler()}>*/}
                            {/*    Back*/}
                            {/*</button>*/}
                            {this.props?.info && <small style={{ textAlign: 'center' }}>{this.props.info}</small>}
                            <Button appearance="primary" type="button" onClick={this.handleFormSubmit} loading={this.props.processing || this.state.processing}>{this.props?.label ? this.props.label : `Pay $${this.props.amount}`}</Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}


export default IFrameApp;