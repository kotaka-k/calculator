import { useNumberState } from './hooks/useNumberState';
import { useSpeech } from './hooks/useSpeech';
import { numberToJapanese } from './utils/japaneseNumber';
import { NumberDisplay } from './components/NumberDisplay';
import { DotVisualizer } from './components/DotVisualizer';
import './App.css';

function App() {
  const {
    digits,
    value,
    incrementDigit,
    decrementDigit,
    addDigit,
    removeDigit
  } = useNumberState();

  const { speak } = useSpeech();

  const handleSpeak = () => {
    const text = numberToJapanese(value);
    console.log('Speaking:', text);
    speak(text);
  };

  return (
    <div className="app-container">
      <header>
        <h1>かずのおべんきょう</h1>
      </header>

      <main>
        <NumberDisplay
          digits={digits}
          onIncrementDigit={incrementDigit}
          onDecrementDigit={decrementDigit}
          onAddDigit={addDigit}
          onRemoveDigit={removeDigit}
        />

        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <button
            className="speak-btn"
            onClick={handleSpeak}
            aria-label="読み上げる"
          >
            よみあげる 🔊
          </button>
          <div className="reading-text">
            {numberToJapanese(value)}
          </div>
        </div>

        <DotVisualizer value={value} />
      </main>
    </div>
  )
}

export default App;
