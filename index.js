const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const MOVIES_PER_PAGE = 12

const dataPanel = document.querySelector('#data-panel')
const movies = []
let filteredMovies = []
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

// 搜尋
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  // if (!keyword.length) {
  //   return alert('please enter a valid value.')
  // }

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword:' + keyword)
  }


  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }
  renderPaginator(filteredMovies.length)  //新增這裡
  //預設顯示第 1 頁的搜尋結果
  renderMovieList(getMoviesByPage(1))  //修改這裡
})

// 讓畫面只出現指定數量電影
function getMoviesByPage(page) {
  // 三元運算子：搜尋結果有東西，Ａ有東西，就回傳到變數data，如果Ａ沒有東西，就回傳Ｂ到變數data
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)

}

// 讓頁碼變化
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template 
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}


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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
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

// add to favorite
// function addToFavorite(id) {
//   function isMovieIdMatched(movie) {
//     return movie.id === id
//   }
// }
// const movie = movies.find(isMovieIdMatched)

// add to favorite
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovieList')) || []
  // JSON.parse()會把getItem的字串變成object或array
  const movie = movies.find(movie => movie.id === id)
  // 等於上面的函示＋const movie的內容
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovieList', JSON.stringify(list))

  // const jsonString = JSON.stringify(list)
  // console.log('JSON string:', jsonString)
  // console.log('JSON object:', JSON.parse(jsonString))
  // JSON.stringify會把JS的資料變成字串
  // JSON.parse會把字串變成Object或array
}

// addEventLister on MORE & button for adding to favorite
dataPanel.addEventListener('click', function onPanelClick(event) {
  if (event.target.matches('.btn-show-movie')) {
    // dataset的ID回傳值是字串，必須用 Number 轉換成數字
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// addEventListener on paginator
paginator.addEventListener('click', function onPaginationClicked(event) {
  // 如果點擊的不是a標籤，結束函式，tageNeme的值會保留原始的大小寫，但回傳內容為html時，原本的小寫會回傳為大寫，所以a標籤代表連結，回傳會變成 A，因此比對的值會變成 A
  if (event.target.tagName !== 'A') return
  // 透過dataset取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  // 重新渲染更新後的畫面
  renderMovieList(getMoviesByPage(page))
})

// get all movies from API
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))