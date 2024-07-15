import React, { Component } from "react";
import {
  API_URL,
  API_KEY,
  IMAGE_BASE_URL,
  POSTER_SIZE,
  BACKDROP_SIZE,
} from "../../config";
import HeroImage from "../elements/HeroImage/HeroImage";
import SearchBar from "../elements/SearchBar/SearchBar";
import FourColGrid from "../elements/FourColGrid/FourColGrid";
import MovieThumb from "../elements/MovieThumb/MovieThumb";
import LoadMoreBtn from "../elements/LoadMoreBtn/LoadMoreBtn";
import Spinner from "../elements/Spinner/Spinner";
import { state } from "../App/Data.store";

import "./Home.css";

class Home extends Component {
  state = state("home");

  componentDidMount() {
    if (localStorage.getItem("HomeState")) {
      // take the string from local storage and convert back to state obj
      const state = JSON.parse(localStorage.getItem("HomeState"));
      this.setState({ ...state });
    } else {
      this.setState({ loading: true });
      const endpoint = `${API_URL}movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
      this.fetchItems(endpoint);
    }
  }

  searchItems = async (searchTerm, searchStartDate, searchEndDate) => {
    let endpoint = "";
    this.setState({
      movies: [],
      loading: true,
      searchTerm: searchTerm,
      searchStartDate: searchStartDate,
      searchEndDate: searchEndDate,
    });
    if (searchTerm === "" && searchStartDate === "" && searchEndDate === "") {
      endpoint = `${API_URL}movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
    } else {
      if (searchStartDate) {
        searchStartDate = new Date(searchStartDate).toISOString().split('T')[0];
      }
      if (searchEndDate) {
        searchEndDate = new Date(searchEndDate).toISOString().split('T')[0];
      }
      // TODO: Update API. Discover does not take a query string
      endpoint = `${API_URL}discover/movie?api_key=${API_KEY}&language=en-US&query=${searchTerm}&primary_release_date.gte=${searchStartDate}&primary_release_date.lte=${searchEndDate}`;
    }

    this.fetchItems(endpoint);
  };

  fetchItems = async (endpoint) => {
    const result = await (await fetch(endpoint)).json();

    console.log(result);

    let currentlyPlaying = [];
    if (this.state.currentPage === 1) {
      currentlyPlaying = await this.fetchCurrentlyPlaying(
        this.state.searchTerm
      );
    }

    this.updateMovies(currentlyPlaying, result);
  };

  loadMoreItems = async () => {
    let endpoint = "";
    this.setState({ loading: true });
    if (this.state.searchTerm === "") {
      endpoint = `${API_URL}movie/popular?api_key=${API_KEY}&language=en-US&page=${this.state.currentPage + 1
        }`;
    } else {
      // TODO: Update API to use time based search
      endpoint = `${API_URL}search/movie?api_key=${API_KEY}&language=en-US&query=${this.state.searchTerm
        }&pages=${this.state.currentPage + 1}`;
    }

    this.fetchItems(endpoint);
  };

  fetchCurrentlyPlaying = async (searchTerm) => {
    if (!localStorage.getItem("CurrentlyPlaying")) {
      localStorage.setItem(
        "CurrentlyPlaying",
        JSON.stringify(
          await (
            await fetch(
              `${API_URL}movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`
            )
          ).json()
        )
      );
    }

    return JSON.parse(
      localStorage.getItem("CurrentlyPlaying")
    ).results.filter(({ original_title }) =>
      original_title.toLocaleLowerCase().match(searchTerm.toLocaleLowerCase())
    );
  };

  updateMovies = (currentlyPlaying, searchResult) => {
    const { movies, heroImage, searchTerm } = this.state;
    try {
      this.setState(
        {
          currentlyPlaying,
          // this will copy old movies and append new
          movies: [...movies, ...searchResult.results],
          heroImage: heroImage || searchResult.results[0],
          loading: false,
          currentPage: searchResult.page,
          totalPages: searchResult.total_pages,
        },
        () => {
          if (searchTerm !== "") {
            // store the data in local storage after state updates
            localStorage.setItem("HomeState", JSON.stringify(this.state));
          }
        }
      );
    } catch (err) {
      console.log("Error:", err);
    }
  };

  render() {
    //es6 destructuring the state
    const {
      movies,
      currentlyPlaying = [],
      heroImage,
      loading,
      currentPage,
      totalPages,
      searchTerm,
    } = this.state;

    return (
      <div className="rmdb-home">
        {heroImage ? (
          <div>
            <HeroImage
              image={`${IMAGE_BASE_URL}${BACKDROP_SIZE}${heroImage.backdrop_path}`}
              title={heroImage.original_title}
              text={heroImage.overview}
            />
            <SearchBar callback={this.searchItems} />
          </div>
        ) : null}

        <div className="rmdb-home-grid">
          {Boolean(currentlyPlaying.length) && (
            <FourColGrid header={"Currently Playing"} loading={loading}>
              {currentlyPlaying.map((element, i) => {
                return (
                  <MovieThumb
                    key={i}
                    clickable={true}
                    image={element.poster_path && `${IMAGE_BASE_URL}${POSTER_SIZE}${element.poster_path}`}
                    movieId={element.id}
                    movieName={element.original_title}
                  />
                );
              })}
            </FourColGrid>
          )}
          <FourColGrid
            header={searchTerm ? "Search Results" : "Popular Movies"}
            loading={loading}
          >
            {movies.map((element, i) => {
              return (
                <MovieThumb
                  key={i}
                  clickable={true}
                  image={element.poster_path && `${IMAGE_BASE_URL}${POSTER_SIZE}${element.poster_path}`}
                  movieId={element.id}
                  movieName={element.original_title}
                />
              );
            })}
          </FourColGrid>
          {loading ? <Spinner /> : null}
          {currentPage <= totalPages && !loading ? (
            <LoadMoreBtn text="Load More" onClick={this.loadMoreItems} />
          ) : null}
        </div>
      </div>
    );
  }
}

export default Home;
