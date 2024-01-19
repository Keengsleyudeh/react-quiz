import { useEffect, useReducer } from 'react'
import Header from './Header.js'
import Main from './Main.js'
import Loader from './Loader.js'
import Error from './Error.js'
import StartScreen from './StartScreen.js'
import Question from './Question.js'
import NextButton from './NextButton.js'
import Progress from './Progress.js'
import FinishedScreen from './FinishedScreen.js'
import Footer from './Footer.js'
import Timer from './Timer.js'

const SECS_PER_QUESTION = 10;
const initialState = {
  questions: [],

  //'loading', 'error', 'ready', 'active', 'finished'
  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  highScore: 0,
  secondsRemaining: null
}

function reducer(state, action) {
  switch(action.type) {
    case "dataReceived":
      return {
        ...state, questions: action.payload,
        status: 'ready'
      }
    case "dataFailed":
      return {
        ...state, status: 'error'
      }
    case "start":
      return {
        ...state, status: 'active',
        secondsRemaining: state.questions.length * SECS_PER_QUESTION
      }
    case "newAnswer":
      const question = state.questions.at(state.index)
      return {
        ...state, 
        answer: action.payload, 
        points: action.payload === question.correctOption? 
        state.points + question.points 
        :state.points
      }
    case  "nextQuestion":
      return {
        ...state, index: state.index + 1,
        answer: null
      }
    case "finished" :
      return {
        ...state, status: "finished",
        highScore: state.points > state.highScore? state.points : state.highScore
      }
    case "restart":
      return {
        // ...state, index: 0,
        // answer: null,
        // points: 0,
        // status: "ready",
        // // highScore: 0
        ...initialState, questions: state.questions, status: "ready"
      }
    case "tick": 
      return {
        ...state,  secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0? "finished": state.status
      }
      
      
    default:
      throw new Error("Action Unknown")
  }
}

export default function App() {

  const [{questions, status, index, answer, points, highScore, secondsRemaining}, dispatch] = useReducer(reducer, initialState);

  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce((prev, cur)=> prev + cur.points, 0);

  useEffect(function () {
    fetch("http://localhost:8000/questions")
    .then((res)=>res.json())
    .then((data)=>dispatch({type: "dataReceived", payload:data}))
    .catch((err)=>dispatch({type: 'dataFailed', payload: "Action Unknown"}))
  }, [])
  
  return <div className='app'>
    <Header />

    <Main>
      {status==="loading" && <Loader/>}
      {status==="error" && <Error/>}
      {status==="ready" && <StartScreen numQuestions={numQuestions} dispatch={dispatch} />}
      {status==="active" && 
      <>
        <Progress 
          index={index} 
          numQuestions={numQuestions} 
          points={points}
          maxPossiblePoints={maxPossiblePoints}
          answer={answer}
        />

        <Question 
          questions={questions[index]} 
          dispatch={dispatch} 
          answer={answer} 
        />

        <Footer>
          <Timer secondsRemaining={secondsRemaining} dispatch={dispatch}/>

          <NextButton 
          answer={answer} 
          dispatch={dispatch}
          index = {index}
          numQuestions = {numQuestions}
        />
        </Footer>

      </>
      }
      {status === "finished" && <FinishedScreen 
        points={points}
        maxPossiblePoints={maxPossiblePoints}
        highScore={highScore}
        dispatch={dispatch}
        />}
    </Main>
  </div>
}
