import React, { useState, useEffect } from "react";
import styles from "./Question.module.css";
import { useNavigate, useLocation } from "react-router-dom";

const Question = () => {
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [highlightedWords, setHighlightedWords] = useState([]);
  const [showFullPassage, setShowFullPassage] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [elapsedTime, setElapsedTime] = useState("");
  const [intervalId, setIntervalId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { passage, questions } = location.state || {
    passage: "",
    questions: [],
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleOptionChange = (questionIndex, answer) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[questionIndex] = answer;
    setSelectedAnswers(updatedAnswers);
  };

  const startTimer = () => {
    const id = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds + 1);
    }, 1000);
    setIntervalId(id);
  };

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, []);

  const handleSubmit = () => {
    stopTimer();
    const elapsedMinutes = Math.floor(seconds / 60);
    const elapsedDisplaySeconds = seconds % 60;
    setElapsedTime(`${elapsedMinutes}분 ${elapsedDisplaySeconds}초`);
    setShowPopup(true);
  };

  const handleConfirm = () => {
    navigate("/Solution");
  };

  const handleCancel = () => {
    setShowPopup(false);
    startTimer();
  };

  const handleShowFullPassage = () => {
    setShowFullPassage(true);
  };

  const handleCloseFullPassage = () => {
    setShowFullPassage(false);
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text && !highlightedWords.includes(text)) {
      setHighlightedWords((prevWords) => [...prevWords, text]);
      highlightSelectedText();
    }
  };

  const highlightSelectedText = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.className = styles.highlight;
      span.textContent = selection.toString();
      range.deleteContents();
      range.insertNode(span);
      selection.removeAllRanges();
    }
  };

  const minutes = Math.floor(seconds / 60);
  const displaySeconds = seconds % 60;

  const handleDeleteWord = (index) => {
    setHighlightedWords((prevWords) => prevWords.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.container} onMouseUp={handleMouseUp}>
      <div className={styles.content}>
        {!showFullPassage ? (
          <div className={styles.passage}>
            <div style={{ color: "grey", marginBottom: "15px" }}>
              * 모르는 단어가 있으면 클릭해두고, 해설창에서 확인하세요!
            </div>
            <div style={{ fontWeight: "bold" }}>
              [1-5] 다음 글을 읽고 질문에 답하시오.
            </div>
            <div className={styles.BTNs}>
              <button className={styles.WordBtn} onClick={openModal}>
                모르는 단어
              </button>
              <button
                onClick={handleShowFullPassage}
                className={styles.showPassageButton}
              >
                지문만 보기
              </button>
            </div>

            {isModalOpen && (
              <div className={styles.modalOverlay} onClick={closeModal}>
                <div
                  className={styles.modalContent}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className={styles.modalHeader}>모르는 단어</h3>
                  <ul className={styles.wordList}>
                    {highlightedWords.map((word, index) => (
                      <li key={index} className={styles.wordItem}>
                        {index + 1}. {word}
                        <button
                          onClick={() => handleDeleteWord(index)}
                          className={styles.deleteButton}
                        >
                          X
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={closeModal}
                    className={styles.closeButton}
                  ></button>
                </div>
              </div>
            )}

            <div className={styles.Jimoon}>
              <p>{passage}</p> {/* 전달받은 content를 표시 */}
            </div>
          </div>
        ) : (
          <div className={styles.fullPassage}>
            <button
              onClick={handleCloseFullPassage}
              className={styles.CloseFullPassageBTN}
            >
              문제로 돌아가기
            </button>
            <div className={styles.FullJimoon}>
              <p>{passage}</p> {/* 전체 지문 보기에서도 content 표시 */}
            </div>
          </div>
        )}

        <div className={styles.questions}>
          <div className={styles.Timer}>
            {isVisible && (
              <h1>
                {minutes}:
                {displaySeconds < 10 ? `0${displaySeconds}` : displaySeconds}
              </h1>
            )}
          </div>
          <button
            className={styles.timerBTN}
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? "HIDE" : "SHOW"}
          </button>
          <ol>
            {questions.map((item, index) => (
              <li key={index}>
                <p>{item.question_text}</p>{" "}
                {/* 전달받은 question_text를 표시 */}
                {[
                  item.choice1,
                  item.choice2,
                  item.choice3,
                  item.choice4,
                  item.choice5,
                ].map((option, optionIndex) => (
                  <div key={optionIndex} className={styles.option}>
                    <input
                      className={styles.radioBtn}
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={selectedAnswers[index] === option}
                      onChange={() => handleOptionChange(index, option)}
                    />
                    <label className={styles.checked}>{option}</label>
                  </div>
                ))}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <button className={styles.submitButton} onClick={handleSubmit}>
        답안 제출하기
      </button>

      {showPopup && (
        <div className={styles.popup}>
          <p>정말 제출하시겠습니까?</p>
          <p>소요 시간: {elapsedTime}</p>
          <div>
            <button onClick={handleCancel} className={styles.cancelButton}>
              뒤로 가기
            </button>
            <button onClick={handleConfirm} className={styles.confirmButton}>
              제출하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Question;
