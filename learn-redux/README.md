# learn-redux

만들면서 배운 점 정리

## 📗 reducer 모듈 만들기

한 파일 안에 특정 리소스에 대한 `action type`, `action creator`, `reducer` 정보를 몰아 작성하는 것을 `ducks 패턴`이라고 한다.

### 1. reducer 생성

src/modules 폴더 아래에 `counter.js`, `todos.js` 처럼 파일을 생성한 다음 `action type`, `initial state`, `action creator`, `reducer`를 작성한다.

이때 `action creator` 함수는 export로, `reducer`는 export default로 내보낸다.

### 2. root reducer 생성하기

modules/index.js를 생성한다. 그리고 다음과 같이 counter와 todos 모듈을 불러와 하나의 root reducer로 합친다.

```js
import { combineReducers } from 'redux';
import counter from './counter';
import todos from './todos';

const rootReducer = combineReducers({
  counter,
  todos,
});

export default rootReducer;
```

### 3. store 만들고 적용하기

먼저 react-redux 패키지를 설치한다. redux 자체는 JS용 라이브러리이기 때문에 react와 redux를 바인딩하기 위해 react-redux가 필요하다.

그 다음 src/index.js에서 `createStore(rootReducer)`로 store를 생성하고, Provider로 store를 내려준다.

```js
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './modules';

const store = createStore(rootReducer);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

## 📗 store와 통신하는 컴포넌트 / UI를 담당하는 컴포넌트로 나눠 작성하기

UI만 담당하는 컴포넌트(프리젠테이셔널 컴포넌트)와 store와의 데이터 통신 등 데이터 처리를 담당하는 컴포넌트(컨테이너 컴포넌트)로 나누어 작성한다면 디버깅할 때 좋을 것이다. UI 담당 컴포넌트는 직접 데이터에 접근하지 않고 props로 필요한 함수와 값을 받아온다.

### 1. UI 담당 컴포넌트

카운터의 UI를 담당하는 컴포넌트를 먼저 만들자.  
직접 데이터를 다루지 않고 props로 필요한 값과 dispatch() 로직을 포함한 함수를 받아온다.

```js
function Counter({ number, diff, onIncrease, onDecrease, onSetDiff }) {
  const onChange = (e) => {
    const parsedValue = parseInt(e.target.value) || ''; // 숫자가 아닌 값 혹은 빈칸을 parse하게 되면 value로 NaN이 배정되어 에러가 발생하기 때문에 이를 방지하고자 or 문을 사용했다.
    onSetDiff(parsedValue);
  };

  return (
    <div>
      <h1>{number}</h1>
      <input type="number" value={diff} min="1" onChange={onChange} />
      <button onClick={onIncrease} />
      <button onDecrease={onDecrease}>
    </div>
  );
}
```

### 2. useSelector(), useDispatch() - store 값 가져오기 / 변경하기

> store로부터 값을 꺼내는 방법은 `useSelector(state => state.counter })`처럼 화살표 함수로 state를 받아와 state.모듈명으로 원하는 값을 반환하면 된다.

아래의 예제에서는 객체 형태로 반환했는데, 객체로 반환하면 구조분해 할당을 통해 값을 바로 변수에 저장할 수 있기 때문이다.

```js
import { useSelector, useDispatch } from 'react-redux';
import Counter from './Counter';
import { increase, decrease, setDoff } from '../modules/counter';

function CounterContainer() {
  const { number, diff } = useSelector(state => {
    name: state.counter.number,
    diff: state.counter.diff
  });

  // useReducer의 dispatch와 같다. 다만 useDispatch()는 react-redux로부터 가져온다.
  const dispatch = useDispatch();
  // increase, ...는 action creator 함수.
  // onIncrease = dispatch(increase()); 를 하면 dispatch를 바로 실행하는 것이 된다. onIncrease 변수에 함수를 할당해야 한다는 것을 잊지 말자.
  const onIncrease = () => dispatch(increase());
  const onDecrease = () => dispatch(decrease());
  const onSetDiff = diff => dispatch(setDiff(diff));

  return (
    <Counter
      number={number}
      diff={diff}
      onIncrease={onIncrease}
      onDecrease={onDecrease}
      onSetDiff={onSetDiff}
    />
  );
}
```

## 📗 Redux 개발자 툴 적용

1. 웹 스토어에서 [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)를 설치한다. (크롬 브라우저측을 위한 설정)
2. `npm install @redux-devtools/extension` (react 측을 위한 설정)
3. store 생성 코드의 두번째 인자로 composeWithDevTools()를 추가한다

   ```js
   // ...
   import { composeWithDevTools } from '@redux-devtools/extension';

   const store = createStore(rootReducer, composeWithDevTools());
   ```

## 📗 React.memo()로 감싸도 컴포넌트가 렌더링될 때 - 함수로 인한 리렌더링도 의심해라

`React.memo()`로 컴포넌트를 감싸도 리렌더링이 되면 상위의 컴포넌트도 감싸면 된다. 그런데 투두리스트를 만들때 `<TodoItem>`과 `<TodoList>`를 감싸도 계속 존재하는 모든 `<TodoItem>`이 리렌더링됐다.

원래는 리스트에 어떤 아이템을 추가하면 새로 추가한 아이템 하나와 그 아이템이 추가될 리스트, 리스트를 포함한 컴포넌트만 리렌더링되는 것이 정상이다. 하지만 아무리 아이템과 리스트를 `React.memo()`로 감싸도 리렌더링되었다.

그 이유를 찾아보니 `<Todos>` 컴포넌트를 감싸며 데이터 내려주는 일을 하는 `<TodoContainer>`가 리렌더링되는 것이었다. 그래서 하위에 존재하는 `<Todos>`, `<TodoList>`, ... 들도 덩달아 리렌더링되었다. 그래서 `<TodoContainer>`의 리렌더링을 막고자 그곳에 존재하는 함수를 `useCallback`으로 감싸줬더니 원하는 대로 최적화가 되었다.

어떤 컴포넌트가 계속 리렌더링된다면 그보다 상위 컴포넌트를 최적화하고, 그래도 안된다면 함수가 최적화되지 않았는지 의심해보자.

## 📗 useSelector()로 인해 리렌더링이 되는 경우

컴포넌트가 리렌더링될 때마다 `useSelector()`도 값을 새로 조회한다. 그리고 이전과 값이 같다면 리렌더링을 하지 않는다. 그런데 만약 `const { number, diff } = useSelector(state 참조 코드)` 처럼 참조하면 매번 새로운 객체를 생성하는 게 되므로 리렌더링이 발생한다.

### 리렌더링 방지 방법 1

변수를 객체가 아니라 따로따로 참조한다.

```js
const number = useSelector((state) => state.counter.number);
const diff = useSelector((state) => state.counter.diff);
```

### 리렌더링 방지 방법 2

`react-redux`의 `shallowEqual` 함수를 `useSelector()`의 두 번째 인자에 넣는다. shallowEqual 함수는 `react-redux`의 내장 함수이며, 객체의 가장 겉에 있는 레벨의 값을 비교해 이전과 달라졌는지 true/false를 반환한다. 이렇게 useSelector()의 두 번째 인자에 shallowEqual을 통해 `boolean` 값을 주어 redux를 최적화할 수 있다.

```js
const { number, diff } = useSelector(
  (state) => ({
    number: state.counter.number,
    diff: state.counter.diff,
  }),
  shallowEqual
);
```
