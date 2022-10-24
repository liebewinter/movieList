const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const dataPanel = document.querySelector('#data-panel')
const movies = JSON.parse(localStorage.getItem('favoriteMovieList')) || []
// 拿localStorage收藏的資料
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')




// 韓式要保持單純，即一個函式只做一件事
function renderMovieList(data) {
  // 為了使函式在不同的情境下都可以重複被使用，因此要降低耦合性(coupling)，指不要跟其他程式產生關係，如導演跟演員資料會從renderMovies函式render出來，如果函式的輸入值不是data，而是movies，則這個函式只能夠被movies使用
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}

// INDEX_URL + ID指定
function showMovieModal(id) {
  const movieModalTitle = document.querySelector('#movie-modal-title')
  const movieModalImage = document.querySelector('#movie-modal-image')
  const movieModalDate = document.querySelector('#movie-modal-date')
  const movieDescription = document.querySelector('#movie-modal-description')
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      movieModalTitle.innerText = data.title
      movieModalDate.innerText = 'Release date: ' + data.release_date
      movieDescription.innerText = data.description
      movieModalImage.innerHTML = `<img src ="${POSTER_URL + data.image}" alt = "movie-poster" class="img-fluid">`
    })
    .catch((err) => console.log(err))
}

function removeFromFavortie(id) {
  if (!movies || !movies.length === 0) return

  // 通過ID找到要刪除電影的index（使用splice要用到）
  const movieIndex = movies.findIndex((movie) => movie.id === id)


  if (movieIndex === -1) return
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovieList', JSON.stringify(movies))

  // 更新畫面
  renderMovieList(movies)
}
// add to favorite
// function addToFavorite(id) {
//   function isMovieIdMatched(movie) {
//     return movie.id === id
//   }
// }
// const movie = movies.find(isMovieIdMatched)

// addEventLister on MORE
dataPanel.addEventListener('click', function onPanelClick(event) {
  if (event.target.matches('.btn-show-movie')) {
    // dataset的ID回傳值是字串，必須用 Number 轉換成數字
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove')) {
    removeFromFavortie(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)