import { useEffect, useState, useRef } from "react";
import StarRating from './StarRating';
import { useMovies } from './useMovies';
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

 const KEY = "d9a817c0";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [watched, setWatched] = useLocalStorageState([], "watched");

  // const [watched, setWatched] = useState(
  //   function(){
  //     const storedValue = localStorage.getItem('watched')
  //     return JSON.parse(storedValue)
  //   }
  // );

  const{movies, isLoading, error}= useMovies(query, handleCloseMovie);

  function handleSelectMovie(id){
    setSelectedId((selectedId)=>(id === selectedId ? null : id));
  }

  function handleCloseMovie(){
    setSelectedId(null);
  }
 
  function handleAddWatched(movie){
    setWatched((watched)=>([...watched, movie]));

    // localStorage.setItem('watched', JSON.stringify([...watched, movie]));

  }

  function handleDeleteWatched(id){
    setWatched((watched)=>(watched.filter(movie=>movie.imdbID!==id)));
  }

  /**
 * This effect hook is used to save the 'watched' state to the local storage whenever it changes.
 * It listens to the 'watched' state and updates the local storage accordingly.
 *
 * @param {Array} watched - The array of movies that the user has watched.
 * @returns {void}
 */
  

  // useEffect(function () {
  //   const controller = new AbortController();

  //   async function fetchMovies(){
  //     try{
  //       setIsLoading(true);
  //       setError("");
  //       const res = await fetch(
  //         `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {signal: controller.signal});

  //       const data = await res.json();

  //       if (data.Response === "False") throw new Error ("Movie Not Found")

  //       setMovies(data.Search);
  //       setError("");
  
  //     } catch(err) {
  //         if (err.name !== "AbortError"){
  //           setError(err.message);
  //         }
  //     }finally{
  //       setIsLoading(false);
  //     }
  //   }

  //   if (query.length < 3) {
  //     setMovies([]);
  //     setError("");
  //     return
  //   }

  //   handleCloseMovie();
  //   fetchMovies();

  //   return function(){
  //     controller.abort();
  //   }
  // }, [query]);



  return (
    <>
      <NavBar  >
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && <MoviesList movies={movies} onSelectMovie ={handleSelectMovie}/>}
          {error && <ErrorMessage message={error}/>}
        </Box>
        <Box> 
          {
            selectedId ? 
              <MovieDetails 
                selectedId={selectedId} 
                onCloseMovie ={handleCloseMovie}
                onAddWatched={handleAddWatched}
                watched ={watched}
              /> 
            :
            <>
              <Summary watched={watched} />
              <WatchedMoviesList 
                movies={watched} 
                onDeleteWatched ={handleDeleteWatched}
              />
            </>
          }
        </Box>
      </Main>    
    </>
  );
}

function Loader(){
  return <p>Loading...</p>
}

function ErrorMessage({message}){
  return(
  <p className="error">
    <span>⛔</span>{message}
  </p>
)
}

function NavBar({children}){
  return (
    <nav className="nav-bar">
      {children}
    </nav>
  )
}

function Main({children}){
  return (
    <main className="main">
      {children}  
    </main>
  )
}

function Logo(){
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  )
}

function Search({query, setQuery}){
  // useEffect(function(){
  //   const el = document.querySelector('.search');
  //   el.focus();
  // },[])
  // This is a wrong implementation to focus the search input
   
  const inputEl =  useRef(null);

  useKey('Enter', function (){
    if (document.activeElement === inputEl.current) return;

      inputEl.current.focus();
      setQuery(''); 
  })

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref ={inputEl}
    />
  );
}

function NumResults({movies}){
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  )
}

function Box({children}){ 
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && (
       children
      )}
    </div>
  );
}

function MoviesList({movies, onSelectMovie }){
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie 
          movie = {movie} 
          key={movie.imdbID} 
          onSelectMovie={onSelectMovie}
        />
      ))}
    </ul>
  )
}

function Movie({movie, onSelectMovie}){
  return (
    <li onClick={()=> onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

function MovieDetails({selectedId, onCloseMovie, onAddWatched, watched}){
  const [movie, setmovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');

  // countRef is used to keep track of the number of times the user has rated the movie. 
  const countRef = useRef(0);

  /**
 * This effect hook is used to keep track of the number of times the user has rated a movie.
 * It increments the countRef.current value whenever the userRating state changes.
 */
  useEffect(function(){
    if (userRating) countRef.current=countRef.current++
  },[userRating]);

  // const isWatched = watched.map((movie)=>movie.imdbID).includes(selectedId);

  const watchedUserRating = watched.find((movie)=> movie.imdbID === selectedId)?.userRating;

  const {
    Title:title, 
    Year: year,
    Poster: poster,
    Runtime:runtime, 
    imdbRating,
    Plot:plot,
    Released:released,
    Actors:actors, 
    Director:director,
    Genre:genre
  }=movie;

  // const [avgRating, setAvgRating] = useState(0);

  function handleAdd(){
    const newWatchedMovie ={
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime:Number(runtime.split(" ")[0]),
      userRating,
      countRatingDecisions: countRef.current,
    }
    onAddWatched(newWatchedMovie);
    onCloseMovie();

    // setAvgRating(Number(imdbRating));
    // // in the next line we can use any name for the average rating, like movie.averageRating this is becuase useState functions return the current state of the variable.
    // setAvgRating((avgRating)=> (avgRating + userRating)/2)
  }
  
  useKey("Escape", onCloseMovie);

  useEffect(function(){
    function callback(e){
      if (e.code ==="Escape"){
        onCloseMovie();
      }
    }

    document.addEventListener("keydown", callback);

    return function(){
      document.removeEventListener("keydown", callback);
    }
  },[onCloseMovie])

  useEffect(function () {
    async function getMovieDetails(){
      setIsLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);

      const data = await res.json();
      setmovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  },[selectedId]);

  useEffect(function(){
    if (!title) return;
    document.title = `Movie | ${title}`;

    return function(){
      document.title = "usePopcorn";
    }
  },[title])

  return (
    <div 
      className="details" 
    >
      {
        isLoading ? <Loader /> :
        <>
          <header>
          <button 
            className="btn-back"
            onClick={onCloseMovie}
          >
            &larr;
          </button>
          <img src={poster} alt={`${title} poster`} />
          <div className="details-overview">
            <h2>{title}</h2>
            <p>
              {released} &bull; {runtime}
            </p>
            <p>{genre}</p>
            <p><span>⭐</span>{imdbRating} IMDb rating</p>
          </div>
          </header>

          {/* <p>{avgRating}</p> */}

            <section>
              <div className="rating">
              {
                !watched.some((movie)=>(movie.imdbID === selectedId)) ?
                (
                <>
                  <StarRating 
                    maxRating={10} 
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {
                    userRating > 0 && (
                      <button 
                        className="btn-add"
                        onClick={handleAdd}
                      >
                        + Add to list
                      </button>
                    )
                  }
                </>
              ):(
                <p>
                  You already rated this movie with {watchedUserRating}
                  <span>⭐</span>
                </p>
              )                 
            }
            </div>
            <p><em>{plot}</em></p>
            <p>Starring {actors}</p>
            <p>Directed by: {director}</p>
          </section>
        </>
      }
    </div>
  )
}

function Summary({watched}){
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  )
}

function WatchedMoviesList({movies, onDeleteWatched}){
  return (
    <ul className="list">
      {movies.map((movie) => (
        <WatchedMovie 
          movie={movie} 
          key={movie.imdbID} 
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  )
}

function WatchedMovie({movie, onDeleteWatched}){
  return (
    <li >
      <button 
        className="btn-delete"
        onClick={()=> onDeleteWatched(movie.imdbID)  }
      >X
      </button>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  )
}


