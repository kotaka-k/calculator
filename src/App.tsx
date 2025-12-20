import { useState } from 'react';
import { useNumberState } from './hooks/useNumberState';
import { useSpeech } from './hooks/useSpeech';
import { numberToJapanese } from './utils/japaneseNumber';
import { NumberDisplay } from './components/NumberDisplay';
import { DotVisualizer } from './components/DotVisualizer';
import './App.css';

function App() {
  const {
    value,
    digits,
    incrementDigit,
    decrementDigit,
    multiplyByTen,
    divideByTen
  } = useNumberState();

  /* Speech Logic */
  const { speak } = useSpeech();
  const [showReading, setShowReading] = useState(false);

  const handleSpeak = () => {
    const text = numberToJapanese(value);
    speak(text);
    setShowReading(true);
  };

  const handleValueChange = (fn: (p?: any) => void, arg?: any) => {
    fn(arg);
    setShowReading(false);
  };

  return (
    <div className="app-container landscape-layout">
      {/* Left Panel: Controls */}
      <section className="panel left-panel">
        <header>
          <h1>かずのおべんきょう</h1>
        </header>

        <div className="controls-area">
          <NumberDisplay
            digits={digits}
            onIncrementDigit={(p) => handleValueChange(incrementDigit, p)}
            onDecrementDigit={(p) => handleValueChange(decrementDigit, p)}
            onMultiply={() => handleValueChange(multiplyByTen, undefined)}
            onDivide={() => handleValueChange(divideByTen, undefined)}
          />

          <div className="speech-controls">
            <button
              className="speak-btn"
              onClick={handleSpeak}
              aria-label="読み上げる"
            >
              よみあげる 🔊
            </button>
            <div className="reading-text" style={{ visibility: showReading ? 'visible' : 'hidden' }}>
              {numberToJapanese(value)}
            </div>
          </div>
        </div>
      </section>

      {/* Right Panel: Visualization */}
      <section className="panel right-panel">
        <DotVisualizer value={value} />
      </section>
    </div>
  )
}

export default App;
