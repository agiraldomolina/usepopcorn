import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
import StarRating from './StarRating';

function Test(){
  const [movieRating, setMovieRating] = React.useState(0);

  return (
    <div>
      <StarRating 
        color ={"blue"} 
        maxRating={10}
        onSetRating={setMovieRating} 
      />
      <p>This movie was rated {movieRating} stars</p>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <StarRating 
      maxRating={10} 
      messages ={['Terrible','Bad', 'Okay', 'Good', 'Amazing']} 
    />
    <StarRating 
      size={24}  
      color={"#3a833d"} 
      className ={'test'} 
      messages ={['Terrible','Bad', 'Okay', 'Good', 'Amazing']} 
      defaultRating={3}
    />
    <Test />
  </React.StrictMode>
);
