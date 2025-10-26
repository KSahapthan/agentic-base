import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ActionButtons from '../../components/MentorMind/ActionButtons';
import EvalAgent from '../../components/MentorMind/EvalAgent';
import './MentorMind.css';

// define a functional React component
const MentorMind = () => {
  const [currentSkillId, setCurrentSkillId] = useState(null);
  const [skillDetails, setSkillDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  
  // Quiz-related state
  const [quizState, setQuizState] = useState('idle'); // 'idle', 'learning', 'question', 'evaluation'
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [showContinueButton, setShowContinueButton] = useState(false);
  
  // Topic and subtopic tracking
  const [currentSubtopicIndex, setCurrentSubtopicIndex] = useState(0);
  const [allSubtopics, setAllSubtopics] = useState([]);
  
  // Quiz tracking state
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [currentSubtopicId, setCurrentSubtopicId] = useState(null);

  // Load saved skill ID on mount (only once)
  useEffect(() => {
    const savedId = localStorage.getItem('currentSkillId');
    if (savedId) {
      setCurrentSkillId(savedId);
    }
    setIsLoading(false);
  }, []);

  // Fetch current topic when skill changes
  useEffect(() => {
    if (!currentSkillId) {
      setSkillDetails(null);
      return;
    }

    const fetchCurrentTopic = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/plan/skill-details/${currentSkillId}`);
        console.log('Skill details response:', response.data);
        setSkillDetails(response.data);
      } catch (err) {
        console.error('Error fetching current topic:', err);
        console.error('Error details:', err.response?.data || err.message);
        setSkillDetails({
          skill_name: 'Error loading skill',
          current_topic: 'Error loading topic',
          current_topic_id: 'Error loading topic ID'
        });
      }
    };
    fetchCurrentTopic();
  }, [currentSkillId]);

  // Helper function to reset quiz state
  const resetQuizState = () => {
    setQuizState('idle');
    setCurrentQuestion(null);
    setUserAnswer('');
    setEvaluation(null);
    setCurrentQuestionNumber(1);
    setShowContinueButton(false);
    setCurrentSubtopicIndex(0);
    setAllSubtopics([]);
    setCorrectAnswersCount(0);
    setCurrentSubtopicId(null);
  };

  // Handler to update skill ID
  const handleSkillChange = (skillId) => {
    // Debug log
    console.log('Updating skill ID to:', skillId); 
    
    // Reset quiz state when changing skills
    resetQuizState();
    
    // Update skill ID
    setCurrentSkillId(skillId);
    if (skillId) {
      localStorage.setItem('currentSkillId', skillId);
    } else {
      localStorage.removeItem('currentSkillId');
    }
  };

  // Add effect to monitor state changes
  useEffect(() => {
    console.log('Current skill ID changed to:', currentSkillId);
  }, [currentSkillId]);

  // Handle chat submission
  const handleChatSubmit = async () => {
    if (!userQuery.trim()) return;
    
    setIsLoadingResponse(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/chat/ask', {
        user_query: userQuery,
        skill_id: currentSkillId
      });
      setAiResponse(response.data.response);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setAiResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoadingResponse(false);
    }
  };

  // Handle Enter key press in textarea
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  // Auto-resize textarea based on content
  const handleTextareaChange = (e) => {
    setUserQuery(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  // Load topic data and subtopics
  const loadTopicData = async () => {
    if (!currentSkillId) return;
    
    try {
      const response = await axios.get(`http://127.0.0.1:8000/plan/skill-details/${currentSkillId}`);
      const skillInfo = response.data;
      
      // Load the plan config to get subtopics
      const planResponse = await axios.get(`http://127.0.0.1:8000/plan/get-topic-data/${currentSkillId}/${skillInfo.current_topic_id}`);
      const topicData = planResponse.data;
      
      setAllSubtopics(topicData.subtopics || []);
      setCurrentSubtopicIndex(0);
      
      return topicData;
    } catch (error) {
      console.error('Error loading topic data:', error);
      return null;
    }
  };

  // Quiz functionality
  const startLearning = async () => {
    if (!currentSkillId || !skillDetails) return;
    
    setQuizState('learning');
    setShowContinueButton(false);
    
    try {
      // Load topic data first
      const topicData = await loadTopicData();
      if (!topicData || !topicData.subtopics || topicData.subtopics.length === 0) {
        alert('No subtopics found for this topic. Please check your learning plan.');
        return;
      }
      
      // Start with first subtopic
      const firstSubtopic = topicData.subtopics[0];
      console.log('DEBUG: Starting with first subtopic:', firstSubtopic);
      setCurrentSubtopicIndex(0);
      setCurrentSubtopicId(firstSubtopic.subtopic_id);
      setCorrectAnswersCount(0); // Reset correct answers count
      
      // Generate quiz for first subtopic
      await axios.post('http://127.0.0.1:8000/quiz/generate-quiz', {
        skill_id: currentSkillId,
        topic_id: skillDetails.current_topic_id,
        subtopic_name: firstSubtopic.name,
        subtopic_description: firstSubtopic.description || `Learning about ${firstSubtopic.name}`,
        focus_areas: ['understanding', 'application'],
        user_context: 'Interactive learning session',
        current_mastery: 50
      });
      
      setCurrentQuestionNumber(1);
      loadQuestion(1);
    } catch (error) {
      console.error('Error starting learning:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Error starting learning: ${error.response?.data?.detail || error.message}`);
    }
  };

  const loadQuestion = async (questionNumber, subtopicIndex = null) => {
    const actualSubtopicIndex = (subtopicIndex !== null ? subtopicIndex : currentSubtopicIndex) + 1;
    console.log(`Loading question ${questionNumber} for subtopic index: ${actualSubtopicIndex}`);
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/quiz/get-question', {
        skill_id: currentSkillId,
        topic_id: skillDetails.current_topic_id,
        subtopic_index: actualSubtopicIndex, 
        question_number: questionNumber
      });
      
      console.log(`Question loaded successfully from subtopic ${actualSubtopicIndex}`);
      setCurrentQuestion(response.data.question);
      setQuizState('question');
      setUserAnswer('');
      setEvaluation(null);
    } catch (error) {
      console.error('Error loading question:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Error loading question: ${error.response?.data?.detail || error.message}`);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || !currentQuestion) return;
    
    setQuizState('evaluation');
    setShowContinueButton(false); // Reset continue button state
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/evaluate/evaluate', {
        true_answer: currentQuestion.A,
        user_answer: userAnswer,
        give_feedback: false
      });
      
      setEvaluation(response.data.evaluation);
      
      // Track correct answers
      if (response.data.evaluation.evaluation === '1') {
        setCorrectAnswersCount(prev => prev + 1);
      }
      
      // Only show continue button after evaluation is completely rendered
      // Use a slight delay to ensure the evaluation component has finished rendering
      setTimeout(() => {
        setShowContinueButton(true);
      }, 1500); // Increased delay to ensure evaluation is visible
    } catch (error) {
      console.error('Error evaluating answer:', error);
      setShowContinueButton(false); // Keep button hidden on error
    }
  };

  const nextQuestion = async () => {
    if (currentQuestionNumber < 5) {
      // Move to next question in current subtopic
      const nextNumber = currentQuestionNumber + 1;
      setCurrentQuestionNumber(nextNumber);
      loadQuestion(nextNumber);
    } else {
      // All questions completed for this subtopic
      try {
        console.log('DEBUG: Attempting to complete subtopic:', {
          skill_id: currentSkillId,
          topic_id: skillDetails.current_topic_id,
          subtopic_id: currentSubtopicId,
          currentSubtopicIndex,
          allSubtopicsLength: allSubtopics.length
        });
        
        // Safety check: ensure we have a valid subtopic ID
        if (!currentSubtopicId) {
          console.error('ERROR: currentSubtopicId is null or undefined');
          alert('Error: Current subtopic ID is missing. Please restart the learning session.');
          return;
        }
        
        // Mark current subtopic as completed and update mastery
        await axios.post('http://127.0.0.1:8000/db/mark-subtopic-completed', {
          skill_id: currentSkillId,
          topic_id: skillDetails.current_topic_id,
          subtopic_id: currentSubtopicId
        });
        
        await axios.post('http://127.0.0.1:8000/db/update-subtopic-mastery', {
          skill_id: currentSkillId,
          topic_id: skillDetails.current_topic_id,
          subtopic_id: currentSubtopicId,
          correct_answers: correctAnswersCount,
          total_questions: 5
        });
        
        console.log(`Subtopic ${currentSubtopicId} completed! Correct answers: ${correctAnswersCount}/5`);
        
        // Update topic progress and get next topic/subtopic
        const progressResponse = await axios.post('http://127.0.0.1:8000/db/update-topic-progress', {
          skill_id: currentSkillId,
          topic_id: skillDetails.current_topic_id,
          subtopic_id: currentSubtopicId
        });
        
        const { current_topic_id, all_topics_completed } = progressResponse.data;
        
        if (all_topics_completed) {
          // All topics completed
          setQuizState('idle');
          setShowContinueButton(false);
          alert(`🎉 Congratulations! You have completed all topics for this skill. Final score: ${correctAnswersCount}/5 correct answers in the last subtopic. Great job!`);
        } else if (current_topic_id !== skillDetails.current_topic_id) {
          // Moved to next topic
          console.log(`Moved to next topic: ${current_topic_id}`);
          
          // Update skill details
          const newSkillDetails = await axios.get(`http://127.0.0.1:8000/plan/skill-details/${currentSkillId}`);
          setSkillDetails(newSkillDetails.data);
          
          // Load new topic data
          const topicData = await loadTopicData();
          if (topicData && topicData.subtopics && topicData.subtopics.length > 0) {
            setAllSubtopics(topicData.subtopics);
            setCurrentSubtopicIndex(0);
            setCurrentSubtopicId(topicData.subtopics[0].subtopic_id);
            setCorrectAnswersCount(0);
            
            // Set loading state before generating quiz
            setQuizState('learning');
            
            // Generate quiz for first subtopic of new topic
            await axios.post('http://127.0.0.1:8000/quiz/generate-quiz', {
              skill_id: currentSkillId,
              topic_id: current_topic_id,
              subtopic_name: topicData.subtopics[0].name,
              subtopic_description: topicData.subtopics[0].description || `Learning about ${topicData.subtopics[0].name}`,
              focus_areas: ['understanding', 'application'],
              user_context: 'Interactive learning session',
              current_mastery: 50
            });
            
            setCurrentQuestionNumber(1);
            setQuizState('question');
            setUserAnswer('');
            setEvaluation(null);
            setShowContinueButton(false);
            loadQuestion(1);
          }
        } else {
          // Moved to next subtopic in same topic
          const nextSubtopicIndex = currentSubtopicIndex + 1;
          if (nextSubtopicIndex < allSubtopics.length) {
            console.log(`Moving to next subtopic: ${nextSubtopicIndex + 1}/${allSubtopics.length}`);
            setCurrentSubtopicIndex(nextSubtopicIndex);
            const nextSubtopic = allSubtopics[nextSubtopicIndex];
            console.log('DEBUG: Next subtopic:', nextSubtopic);
            setCurrentSubtopicId(nextSubtopic.subtopic_id);
            setCorrectAnswersCount(0);
            
            // Set loading state before generating quiz
            setQuizState('learning');
            
            // Generate quiz for next subtopic
            await axios.post('http://127.0.0.1:8000/quiz/generate-quiz', {
              skill_id: currentSkillId,
              topic_id: skillDetails.current_topic_id,
              subtopic_name: nextSubtopic.name,
              subtopic_description: nextSubtopic.description || `Learning about ${nextSubtopic.name}`,
              focus_areas: ['understanding', 'application'],
              user_context: 'Interactive learning session',
              current_mastery: 50
            });
            
            setCurrentQuestionNumber(1);
            setQuizState('question');
            setUserAnswer('');
            setEvaluation(null);
            setShowContinueButton(false);
            loadQuestion(1, nextSubtopicIndex);
          }
        }
      } catch (error) {
        console.error('Error completing subtopic:', error);
        console.error('Error details:', {
          response: error.response?.data,
          status: error.response?.status,
          message: error.message,
          currentSubtopicId,
          skillDetails
        });
        alert(`Error completing subtopic: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  // Auto-resize for quiz answer textarea
  const handleQuizAnswerChange = (e) => {
    setUserAnswer(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  if (isLoading) {
    return (
      <div className="mentormind-container loading">
        <div>Loading your learning progress...</div>
      </div>
    );
  }

  return (
    <div className="mentormind-container">
      {/* Left Section — Hint / Chat */}
      <div className="mentormind-panel left-panel">
        <h2 className="panel-title">Hint (or) Chat</h2>
        <ActionButtons 
          onSkillSelect={handleSkillChange}
          currentSkillId={currentSkillId}
        />
        
        {/* Chat Container */}
        <div className="chat-container">
          {/* Input Box */}
          <div className="chat-input-box">
            <textarea
              value={userQuery}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask questions or get hints from the AI tutor here"
              disabled={isLoadingResponse}
            />
          </div>
          
          {/* Response Box - Now with Markdown rendering */}
          <div className="chat-response-box">
            {isLoadingResponse ? (
              'AI tutor is thinking...'
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  // Custom styling for different elements
                  p: ({ children }) => <p style={{ margin: '0 0 12px 0', lineHeight: '1.6' }}>{children}</p>,
                  h1: ({ children }) => <h1 style={{ fontSize: '1.4rem', margin: '0 0 16px 0', fontWeight: 'bold' }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ fontSize: '1.2rem', margin: '0 0 14px 0', fontWeight: 'bold' }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontSize: '1.1rem', margin: '0 0 12px 0', fontWeight: 'bold' }}>{children}</h3>,
                  ul: ({ children }) => <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>{children}</ol>,
                  li: ({ children }) => <li style={{ margin: '4px 0' }}>{children}</li>,
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code style={{ 
                        backgroundColor: '#f4f4f4', 
                        padding: '2px 4px', 
                        borderRadius: '3px',
                        fontFamily: 'monospace',
                        fontSize: '0.9em'
                      }}>
                        {children}
                      </code>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre style={{ 
                      backgroundColor: '#f4f4f4', 
                      padding: '12px', 
                      borderRadius: '6px',
                      overflow: 'auto',
                      margin: '0 0 12px 0',
                      fontSize: '0.9em',
                      lineHeight: '1.4'
                    }}>
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote style={{ 
                      borderLeft: '4px solid #c1a45f', 
                      paddingLeft: '12px', 
                      margin: '0 0 12px 0',
                      fontStyle: 'italic',
                      color: '#666'
                    }}>
                      {children}
                    </blockquote>
                  ),
                  strong: ({ children }) => <strong style={{ fontWeight: 'bold', color: '#3a393f' }}>{children}</strong>,
                  em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>
                }}
              >
                {aiResponse}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>

      {/* Middle Section — Learn / Quiz */}
      <div className="mentormind-panel middle-panel">
        <h2 className="panel-title">Learn (or) Quiz</h2>
        {currentSkillId && skillDetails && (
          <div className="current-skill-info">
            <span className="skill-id">{currentSkillId}</span>
            <span className="separator">•</span>
            <span className="skill-name">{skillDetails.skill_name}</span>
            <span className="separator">•</span>
            <span className="topic-id">{skillDetails.current_topic_id}</span>
            <span className="separator">•</span>
            <span className="topic-name">{skillDetails.current_topic}</span>
          </div>
        )}
        
        {/* Current Subtopic and Question Info */}
        {currentSkillId && skillDetails && (
          <div className="current-skill-info">
            <span className="subtopic-id">Subtopic {currentSubtopicIndex + 1}</span>
            <span className="separator">•</span>
            <span className="subtopic-name">{skillDetails.current_subtopic_name || allSubtopics[currentSubtopicIndex]?.name || 'Loading...'}</span>
            {currentQuestion && (
              <>
                <span className="separator">•</span>
                <span className="question-info">Question {currentQuestionNumber}/5</span>
                <span className="separator">•</span>
                <span className="question-info" style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  Correct: {correctAnswersCount}/5
                </span>
              </>
            )}
          </div>
        )}
        
        {/* Quiz Container */}
        {currentSkillId ? (
          <div className="quiz-container">
            {/* Quiz Question Box */}
            <div className="quiz-question-box">
              <div className="quiz-question-content">
                {quizState === 'idle' && !showContinueButton && (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Ready to continue learning?</p>
                    <button 
                      onClick={startLearning}
                      style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}
                    >
                      Want to continue learning →
                    </button>
                  </div>
                )}
                
                {quizState === 'learning' && (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Generating quiz questions...</p>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px' }}>
                      {currentSubtopicIndex === 0 ? 'Preparing your first quiz' : `Loading questions for subtopic ${currentSubtopicIndex + 1}`}
                    </p>
                  </div>
                )}
                
                {currentQuestion && (
                  <div>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        p: ({ children }) => <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: '0 0 12px 0' }}>{children}</p>,
                        h1: ({ children }) => <h1 style={{ fontSize: '1.4rem', margin: '0 0 16px 0', fontWeight: 'bold' }}>{children}</h1>,
                        h2: ({ children }) => <h2 style={{ fontSize: '1.2rem', margin: '0 0 14px 0', fontWeight: 'bold' }}>{children}</h2>,
                        h3: ({ children }) => <h3 style={{ fontSize: '1.1rem', margin: '0 0 12px 0', fontWeight: 'bold' }}>{children}</h3>,
                        ul: ({ children }) => <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>{children}</ul>,
                        ol: ({ children }) => <ol style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>{children}</ol>,
                        li: ({ children }) => <li style={{ margin: '4px 0' }}>{children}</li>,
                        code: ({ children, className }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code style={{ 
                              backgroundColor: '#f4f4f4', 
                              padding: '2px 4px', 
                              borderRadius: '3px',
                              fontFamily: 'monospace',
                              fontSize: '0.9em'
                            }}>
                              {children}
                            </code>
                          ) : (
                            <code className={className}>{children}</code>
                          );
                        },
                        pre: ({ children }) => (
                          <pre style={{ 
                            backgroundColor: '#f4f4f4', 
                            padding: '12px', 
                            borderRadius: '6px',
                            overflow: 'auto',
                            margin: '0 0 12px 0',
                            fontSize: '0.9em',
                            lineHeight: '1.4'
                          }}>
                            {children}
                          </pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote style={{ 
                            borderLeft: '4px solid #c1a45f', 
                            paddingLeft: '12px', 
                            margin: '0 0 12px 0',
                            fontStyle: 'italic',
                            color: '#666'
                          }}>
                            {children}
                          </blockquote>
                        ),
                        strong: ({ children }) => <strong style={{ fontWeight: 'bold', color: '#3a393f' }}>{children}</strong>,
                        em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>
                      }}
                    >
                      {currentQuestion.Q}
                    </ReactMarkdown>
                  </div>
                )}
                
                {evaluation && (
                  <div>
                    <h3>Evaluation Result</h3>
                    <p style={{ 
                      color: evaluation.evaluation === '1' ? '#4CAF50' : '#f44336',
                      fontWeight: 'bold'
                    }}>
                      {evaluation.evaluation === '1' ? '✅ Correct!' : '❌ Incorrect'}
                    </p>
                    {evaluation.feedback && (
                      <p style={{ fontStyle: 'italic', color: '#666' }}>
                        {evaluation.feedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Quiz Answer Box */}
            {quizState === 'question' && (
              <div className="quiz-answer-box">
                <textarea
                  value={userAnswer}
                  onChange={handleQuizAnswerChange}
                  placeholder="Enter your answer here..."
                  disabled={quizState === 'evaluation'}
                />
                <div style={{ marginTop: '8px', textAlign: 'right' }}>
                  <button
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim() || quizState === 'evaluation'}
                    style={{
                      backgroundColor: '#a08605c1',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Submit Answer
                  </button>
                </div>
              </div>
            )}
            
            {/* Continue Button */}
            {showContinueButton && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  onClick={nextQuestion}
                  disabled={quizState === 'question' || quizState === 'learning'}  // Disable if still on question or generating quiz
                  style={{
                    backgroundColor: (quizState === 'question' || quizState === 'learning') ? '#ccc' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: (quizState === 'question' || quizState === 'learning') ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    opacity: (quizState === 'question' || quizState === 'learning') ? 0.6 : 1
                  }}
                >
                  {currentQuestionNumber < 5 ? 'Next Question →' : 
                   (currentSubtopicIndex + 1 < allSubtopics.length ? 'Next Subtopic →' : 'Complete Topic →')}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="panel-content">
            <p>Select an existing skill or create a skill to start learning</p>
          </div>
        )}
      </div>

      {/* Right Section — Feedback / Explanations */}
      <div className="mentormind-panel right-panel">
        <h2 className="panel-title">Feedback (or) Answers</h2>
        <EvalAgent 
          evaluation={evaluation}
          userAnswer={userAnswer}
          currentQuestion={currentQuestion}
        />
      </div>
    </div>
  );
};

export default MentorMind;
