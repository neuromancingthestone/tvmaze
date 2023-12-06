"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $('#episodesList');
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm( term ) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  let shows = [];


  const showRes = await axios.get("https://api.tvmaze.com/search/shows/",
  {params: {
    q: term
  }}); 

  // Populate an array [shows] with objects that contain data about the shows
  // id - The ID of the show in the API
  // name - The name of the show
  // summary - A summary of the show
  // image - If available, original image URL of the show
  //       - If no image, populate with tv-missing image from tinyurl
  for( let res of showRes.data ) {
    try {      
      shows.push({
        id: res.show.id,
        name: res.show.name,
        summary: res.show.summary,
        image: res.show.image.original
      });
    } catch(e) {
      shows.push({
        id: res.show.id,
        name: res.show.name,
        summary: res.show.summary,
        image: "https://tinyurl.com/tv-missing"
      });      
    }        
  } 

  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {  
  const epiRes = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);

  let episodes = [];

  for( let res of epiRes.data ) {
    try {      
      episodes.push({
        id: res.id,
        name: res.name,
        season: res.season,
        episode: res.number,
        summary: res.summary
      });
    } catch(e) {
      console.log(e);
    }
  }
  return episodes;
}

/** Given list of episodes, create markup for each and to DOM */

function populateEpisodes(episodes) { 
  $episodesList.empty();
  $episodesArea.show();

  for( let ep of episodes ) {
    const $episodes = $(
      `<li>${ep.name} - Season ${ep.season}, Number ${ep.episode}</li>`   
    );
    $episodesList.append($episodes);     
  }
}

const $episodeBtn = $('#episodebtn');

// This is handled by jQuery event delegation, allowing the on() function
// to work after the button is created by the above function populateShows()
$showsList.on("click", "button", async function(evt) {
  evt.preventDefault();
  const episodeRes = await getEpisodesOfShow(($(this).parents("div.Show").data().showId));
  populateEpisodes(episodeRes);
});