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
  } = useNumberState();

  const { speak } = useSpeech();
  const [showReading, setShowReading] = useState(false);

  const handleSpeak = () => {
    const text = numberToJapanese(value);
    speak(text);
    setShowReading(true);
  };

  // Hide reading text when value changes
  // Or keep it? Request: "読み上げるボタンを押すまで読みがなは表示しない"
  // Implies: Initially hidden. Show on click.
  // Should it auto-hide when value changes?
  // "9の状態で↑を押した際は10に..." -> If I change number, the reading is stale if I don't hide it or update it.
  // Usually better to hide it or update it. 
  // Let's hide it when value changes to encourage re-reading.
  // Hook effect? Or just simplify: 
  // We can track "lastSpokenValue". Or just reset on digits change.
  // But modifying App state in useNumberState is hard. 
  // Let's just use effect or key.

  if (showReading && value !== parseInt(numberToJapanese(value) ? '0' : '0')) {
    // This logic is tricky because numberToJapanese returns string.
    // Let's just use a useEffect in component?
    // No, let's just simpler:
    // When `value` changes, `showReading` should probably be false?
    // But `value` changes on every click.
    // Let's assume we want to hide it immediately if number changes.
  }

  // Actually, let's keep it simple: 
  // Just show it when clicked. 
  // If value changes, maybe keep it hidden until clicked again? affirmative.

  // We need to compare current value with spoken value to auto-hide?
  // Or just simpler:
  // On increment/decrement, we are calling hook. 
  // We can pass a callback to useNumberState? No.
  // Let's wrap value change handlers.

  const handleValueChange = (fn: (p: number) => void, arg: number) => {
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
