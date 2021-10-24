import './LoadingSpinner.css';

function LoadingSpinner() {
  return (
    <div className="lds-ripple">
      <div></div>
      <div></div>
    </div>
  );
}

export default LoadingSpinner;
