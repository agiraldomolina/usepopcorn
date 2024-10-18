import { useEffect, useState } from "react";
export function useMovies(query){
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const KEY = "d9a817c0";

    useEffect(function () {
      // callback?.()

      const controller = new AbortController();
  
      async function fetchMovies(){
        try{
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {signal: controller.signal});
  
          const data = await res.json();
  
          if (data.Response === "False") throw new Error ("Movie Not Found")
  
          setMovies(data.Search);
          setError("");
    
        } catch(err) {
            if (err.name !== "AbortError"){
              setError(err.message);
            }
        }finally{
          setIsLoading(false);
        }
      }
  
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return
      }
  
      // handleCloseMovie();
      fetchMovies();
  
      return function(){
        controller.abort();
      }
    }, [query]);
    return {movies, isLoading, error};
}