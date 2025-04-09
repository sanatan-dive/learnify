'use client'
import StudyTimer from '@/components/Timer';
import PomodoroTimer from '@/components/PomodoroTimer';
import ToggleSwitch from '@/components/ui/toggle';
import React, { useState } from 'react';
``
const PomodoroTime = () => {
  return (
    <div className="flex w-full items-center justify-center">
     
      <PomodoroTimer />
      
    </div>
  );
};

const TimerComponent = () => {
  return (
    <div className="flex items-center justify-center">
      
      <StudyTimer/>
    </div>
  );
};

const Pomodoro = () => {
  const [isTimer, setIsTimer] = useState(false);

  const handleToggle = (timerMode : boolean) => {
    setIsTimer(timerMode);
  };

  return (
    <div className='min-h-screen text-white relative p-4'>
      <div className='absolute top-4 right-4'>
        <ToggleSwitch onToggle={handleToggle} />
      </div>
      <div className="">
        {isTimer ? <TimerComponent /> : <PomodoroTime />}
      </div>
    </div>
  );
};

export default Pomodoro;