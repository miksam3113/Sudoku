const start_screen = document.querySelector('#start_screen');
const game_screen = document.querySelector('#game_screen');
const pause_screen = document.querySelector('#pause_screen');
const result_screen = document.querySelector('#result_screen');

const name_input = document.querySelector('#input_name');

const number_inputs = document.querySelectorAll('.number');

const player_name = document.querySelector('#player_name');
const game_level = document.querySelector('#game_level');
const game_time = document.querySelector('#game_time');

const result_time = document.querySelector('#result_time');

let cells = document.querySelectorAll('.main_grid_cell');
let level_index = 0;
let level = CONSTANTS.LEVEL[level_index];

let timer = null;
let pause = false;
let seconds = 0;

let su = undefined;
let su_answer = undefined;

let selected_cell = -1;

const getGameInfo = () => JSON.parse(localStorage.getItem('game'))

const initGameGrid = () => {
  let index = 0;

  for(let i = 0; i < Math.pow(CONSTANTS.GRID_SIZE,2); i++) {
    let row = Math.floor(i/CONSTANTS.GRID_SIZE);
    let col = i % CONSTANTS.GRID_SIZE;
    if(row === 2 || row === 5) cells[index].style.marginBottom = '10px';
    if(col === 2 || col === 5) cells[index].style.marginRight = '10px';

    index++;
  }
}

const setPlayerName = (name) => localStorage.setItem('player_name', name);
const getPlayerName = () => localStorage.getItem('player_name');

const showTime = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8);

const clearSudoku = () => {
  for (let i = 0; i < Math.pow(CONSTANTS.GRID_SIZE, 2); i++) {
    cells[i].innerHTML = '';
    cells[i].classList.remove('filled');
    cells[i].classList.remove('selected');
  }
}

const initSudoku = () => {
  // clear old sudoku
  clearSudoku();
  resetBg();
  // generate sudoku puzzle
  su = sudokuGen(level);
  su_answer = [...su.question];

  seconds = 0;

  saveGameInfo();

  // show sudoku to div
  for(let i = 0; i < Math.pow(CONSTANTS.GRID_SIZE, 2); i++) {
    let row = Math.floor(i / CONSTANTS.GRID_SIZE);
    let col = i % CONSTANTS.GRID_SIZE;

    cells[i].setAttribute('data-value', su.question[row][col]);

    if (su.question[row][col] !== 0) {
      cells[i].classList.add('filled');
      cells[i].innerHTML = su.question[row][col];
    }
  }
}

const loadSudoku = () => {
  let game = getGameInfo();

  game_level.innerHTML = CONSTANTS.LEVEL_NAME[game.level];

  su = game.su;

  su_answer = su.answer;

  seconds = game.seconds;
  game_time.innerHTML = showTime(seconds);

  level_index = game.level;

  // show sudoku to div
  for(let i = 0; i < Math.pow(CONSTANTS.GRID_SIZE, 2); i++) {
    let row = Math.floor(i / CONSTANTS.GRID_SIZE);
    let col = i % CONSTANTS.GRID_SIZE;

    cells[i].setAttribute('data-value', su_answer[row][col]);
    cells[i].innerHTML= su_answer[row][col] !== 0 ? su_answer[row][col] : '';
    if (su.question[row][col] !== 0) {
      cells[i].classList.add('filled');
    }
  }
}

const hoverBg = (index) => {
  let row = Math.floor(index / CONSTANTS.GRID_SIZE);
  let col = index % CONSTANTS.GRID_SIZE;

  let box_start_row = row - row % 3;
  let box_start_col = col - col % 3;

  for (let i = 0; i < CONSTANTS.BOX_SIZE; i++) {
    for (let j = 0; j < CONSTANTS.BOX_SIZE; j++) {
      let cell = cells[9 * (box_start_row + i) + (box_start_col + j)];
      cell.classList.add('hover');
    }
  }

  let step = 9;
  while (index - step >= 0) {
    cells[index - step].classList.add('hover');
    step += 9;
  }

  step = 9;
  while (index + step < 81) {
    cells[index + step].classList.add('hover');
    step += 9;
  }

  step = 1;
  while (index - step >= 9*row) {
    cells[index - step].classList.add('hover');
    step += 1;
  }

  step = 1;
  while (index + step < 9*row + 9) {
    cells[index + step].classList.add('hover');
    step += 1;
  }
}

const resetBg = () => {
  cells.forEach(e => e.classList.remove('hover'));
}

const checkErr = (value) => {
  const addErr = (cell) => {
    if (parseInt(cell.getAttribute('data-value')) === value) {
      cell.classList.add('err');
      cell.classList.add('cell_err');
      setTimeout(() => {
        cell.classList.remove('cell_err');
      }, 500);
    }
  }

  let index = selected_cell;

  let row = Math.floor(index / CONSTANTS.GRID_SIZE);
  let col = index % CONSTANTS.GRID_SIZE;

  let box_start_row = row - row % 3;
  let box_start_col = col - col % 3;

  for (let i = 0; i < CONSTANTS.BOX_SIZE; i++) {
    for (let j = 0; j < CONSTANTS.BOX_SIZE; j++) {
      let cell = cells[9 * (box_start_row + i) + (box_start_col + j)];
      if (!cell.classList.contains('selected')) addErr(cell);
    }
  }

  let step = 9;
  while (index - step >= 0) {
    addErr(cells[index - step]);
    step += 9;
  }

  step = 9;
  while (index + step < 81) {
    addErr(cells[index + step]);
    step += 9;
  }

  step = 1;
  while (index - step >= 9*row) {
    addErr(cells[index - step]);
    step += 1;
  }

  step = 1;
  while (index + step < 9*row + 9) {
    addErr(cells[index + step]);
    step += 1;
  }
}

const removeErr = () => cells.forEach(e => e.classList.remove('err'));

const saveGameInfo = () => {
  let game = {
    level: level_index,
    seconds: seconds,
    su: {
      original: su.original,
      question: su.question,
      answer: su_answer
    }
  }
  console.log(game)
  localStorage.setItem('game', JSON.stringify(game));
}

const removeGameInfo = () => {
  localStorage.removeItem('game');
  document.querySelector('#btn_continue').style.display = 'none';
}

const isGameWin = () => sudokuCheck(su_answer);

const showResult = () => {
  clearInterval(timer);
  result_screen.classList.add('active');
  result_time.innerHTML = showTime(seconds);
}

const initNumberInputEvent = () => {
  number_inputs.forEach((e, index) => {
    e.addEventListener('click', () => {
      if (!cells[selected_cell].classList.contains('filled')) {
        cells[selected_cell].innerHTML = String(index + 1);
        cells[selected_cell].setAttribute('data-value', String(index + 1));
        //add to answer
        let row = Math.floor(selected_cell / CONSTANTS.GRID_SIZE);
        let col = selected_cell % CONSTANTS.GRID_SIZE;
        su_answer[row][col] = index + 1;
        // save game
        saveGameInfo();

        removeErr();
        checkErr(index + 1);
        cells[selected_cell].classList.add('zoom_in');
        setTimeout(() => {
          cells[selected_cell].classList.remove('zoom_in');
        }, 500)

        // check game win
        if(isGameWin()) {
          removeGameInfo();
          showResult();
        }

      }
    })
  })
}

const initCellsEvent = () => {
  cells.forEach((e, index) => {
    e.addEventListener('click', () => {
      if (!e.classList.contains('filled')) {
        cells.forEach(e => e.classList.remove('selected'));

        selected_cell = index;
        e.classList.remove('err');
        e.classList.add('selected');
        resetBg();
        hoverBg(index);
      }
    })
  })
}

const startGame = () => {
  start_screen.classList.remove('active');
  game_screen.classList.add('active');

  player_name.innerHTML = name_input.value.trim();
  setPlayerName(name_input.value.trim());

  game_level.innerHTML = CONSTANTS.LEVEL_NAME[level_index];

  showTime(seconds);

  timer = setInterval(() => {
    if(!pause) {
      seconds = seconds + 1;
      game_time.innerHTML = showTime(seconds);
    }
  }, 1000)
}

const returnStartScreen = () => {
  clearInterval(timer);
  pause = false;
  seconds = 0;
  start_screen.classList.add('active');
  game_screen.classList.remove('active');
  pause_screen.classList.remove('active');
  result_screen.classList.remove('active');
}

document.querySelector('#btn_level').addEventListener('click' , (e) => {
  level_index = level_index + 1 > CONSTANTS.LEVEL.length - 1 ? 0 : level_index + 1;
  level = CONSTANTS.LEVEL[level_index];
  e.target.innerHTML = CONSTANTS.LEVEL_NAME[level_index];
})

document.querySelector('#btn_play').addEventListener('click', () => {
  if(name_input.value.trim().length > 0) {
    initSudoku();
    startGame();
  } else {
    name_input.classList.add('input_err');
    setTimeout(() => {
      name_input.classList.remove('input_err');
      name_input.focus();
    }, 500)
  }
})

document.querySelector('#btn_continue').addEventListener('click', () => {
  if(name_input.value.trim().length > 0) {
    loadSudoku();
    startGame();
  } else {
    name_input.classList.add('input_err');
    setTimeout(() => {
      name_input.classList.remove('input_err');
      name_input.focus();
    }, 500)
  }
})

document.querySelector('#btn_pause').addEventListener('click', () => {
  pause_screen.classList.add('active');
  pause = true;
});

document.querySelector('#btn_resume').addEventListener('click', () => {
  pause_screen.classList.remove('active');
  pause = false;
});

document.querySelector('#btn_new_game').addEventListener('click', () => {
  returnStartScreen();
});

document.querySelector('#btn_new_game_2').addEventListener('click', () => {
  returnStartScreen();
});

document.querySelector('#btn_delete').addEventListener('click', () => {
  cells[selected_cell].innerHTML = '';
  cells[selected_cell].setAttribute('data-value', String(0));

  let row = Math.floor(selected_cell / CONSTANTS.GRID_SIZE);
  let col = selected_cell % CONSTANTS.GRID_SIZE;

  su_answer[row][col] = 0;

  removeErr();
});

const init = () => {
  const game = getGameInfo();
  document.querySelector('#btn_continue').style.display = game ? 'grid' : 'none';

  initGameGrid();
  initCellsEvent();
  initNumberInputEvent();

  if(getPlayerName()) {
    name_input.value = getPlayerName();
  } else {
    name_input.focus();
  }
};

init();
