import { useEffect, useState } from "react";
import { AiOutlineMoon, AiOutlineSun } from "react-icons/ai";
import "./DarkModeToggle.css";

function DarkModeToggle({ darkMode, onToggle }) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      className={`dark-mode-toggle ${darkMode ? 'dark' : 'light'} ${isAnimating ? 'animating' : ''}`}
      onClick={handleToggle}
      aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={darkMode ? 'Modo oscuro activado' : 'Modo claro activado'}
    >
      <div className="toggle-icon-container">
        {darkMode ? (
          <AiOutlineMoon className="toggle-icon" />
        ) : (
          <AiOutlineSun className="toggle-icon" />
        )}
      </div>
      <span className="toggle-label">
        {darkMode ? 'Oscuro' : 'Claro'}
      </span>
    </button>
  );
}

export default DarkModeToggle;

