import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { increase, decrease } from '../modules/counter';
import Counter from './Counter';
import { increaseAsync, decreaseAsync } from '../modules/counter';

function CounterContainer() {
  const dispatch = useDispatch();
  const number = useSelector((state) => state.counter);

  const onIncrease = () => {
    dispatch(increaseAsync());
  };

  const onDecrease = () => {
    dispatch(decreaseAsync());
  };

  return (
    <Counter number={number} onIncrease={onIncrease} onDecrease={onDecrease} />
  );
}

export default CounterContainer;
