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
    maxDigits,
    incrementDigit,
    decrementDigit,
    multiplyByTen,
    divideByTen,
    setMaxDigits
  } = useNumberState();

  /* Speech Logic */
  const { speak } = useSpeech();
  const [showReading, setShowReading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleSpeak = () => {
    const text = numberToJapanese(value);
    speak(text);
    setShowReading(true);
  };

  const handleValueChange = (fn: (p?: any) => void, arg?: any) => {
    fn(arg);
    setShowReading(false);
  };

  const digitLimits = [
    { label: '5けた (万)', value: 5 },
    { label: '9けた (億)', value: 9 },
    { label: '16けた (京)', value: 16 },
    { label: '69けた (無量大数)', value: 69 },
  ];

  return (
    <div className="app-container landscape-layout">
      {/* Settings Button */}
      <button
        className="settings-btn"
        onClick={() => setShowSettings(!showSettings)}
        aria-label="設定"
      >
        ⚙️
      </button>

      {/* Settings Menu */}
      {showSettings && (
        <div className="settings-menu">
          <h3>けたの おおきさ</h3>
          <div className="settings-options">
            {digitLimits.map(limit => (
              <button
                key={limit.value}
                className={`limit-option ${maxDigits === limit.value ? 'active' : ''}`}
                onClick={() => {
                  setMaxDigits(limit.value);
                  setShowSettings(false);
                }}
              >
                {limit.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Left Panel: Controls */}
      <section className="panel left-panel">
        <header>
          <h1>かずのおべんきょう</h1>
        </header>

        <div className="controls-area">
          <NumberDisplay
            digits={digits}
            maxDigits={maxDigits}
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
