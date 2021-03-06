import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import CheckoutItem from "../Checkout/checkout-item";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useStateValue } from "../../context/StateProvider";
import { getBasketTotal } from "../../context/reducer";
import CorrencyFormat from "react-currency-format";
import axios from "../../services/axios";

function Payment() {
  const [{ user, basket }] = useStateValue();

  const history = useHistory();
  const stripe = useStripe();
  const elements = useElements();

  const [succeeded, setSocceeded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [clientSecret, setClientSecret] = useState(false);

  const getClientSecret = async () => {
    try {
      const response = await axios({
        method: "post",
        url: `/payments/create?total=${getBasketTotal(basket) * 100}`,
      });
      console.log("response >>>", response);
      setClientSecret(response?.data?.clientSecret);
    } catch (error) {
      console.log("Error front>>>", error);
    }
  };

  useEffect(() => {
    getClientSecret();
  }, []);

  useEffect(() => {
    getClientSecret();
    console.log("SECRET IS ===>", clientSecret);
  }, [basket]);

  if (clientSecret) {
    alert(clientSecret);
  } else {
    alert(clientSecret);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    const payload = await stripe
      .confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      })
      .then(({ paymentIntnent }) => {
        setSocceeded(true);
        setError(false);
        setProcessing(false);
        history.replace("/orders");
      })
      .catch((err) => {
        console.log(err);
      });

    console.log("Payload", payload);
  };

  const handleChange = (e) => {
    setDisabled(false);
    setError(e.error ? e.error?.message : "");
  };

  return (
    <div className="payment">
      <h1 className="payment__checkout">
        Checkout (<Link to="/checkout"> {basket?.length} items</Link>)
      </h1>
      <div className="payment__inner auto-container">
        <div className="payment__section">
          <div className="payment__title">
            <h3>Delivery address</h3>
          </div>
          <div className="payment__address">
            <p>{user?.email}</p>
            <p>123 React JS</p>
            <p>UZB Fergana</p>
          </div>
        </div>
        <div className="payment__section">
          <div className="payment__title">
            <h3>Review items and delivery</h3>
          </div>
          <div className="payment__items">
            {basket?.map((item, index) => (
              <CheckoutItem key={index} {...item} />
            ))}
          </div>
        </div>
        <div className="payment__section">
          <div className="payment__title">
            <h3>Payment Method</h3>
          </div>
          <div className="payment__details">
            <form onSubmit={handleSubmit}>
              <CardElement onChange={handleChange} />

              <div className="payment__price">
                <CorrencyFormat
                  renderText={(value) => <h3>Order Total: {value}</h3>}
                  decimalScale={2}
                  value={getBasketTotal(basket)}
                  displayType={"text"}
                  thousandSeparator={true}
                  prefix={"$"}
                />
              </div>
              {error ? <p className="error-text">{error}</p> : null}
              <button
                className="btn btn__primary"
                disabled={clientSecret && (processing || disabled || succeeded)}
              >
                {processing ? "processing" : "Buy now"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
