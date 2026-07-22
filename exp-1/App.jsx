import { useCallback } from 'react';
import { usePostComposer } from './hooks/usePostComposer';
import { useHistory } from './hooks/useHistory';
import PlatformSelector from './components/PlatformSelector';
import TextEditor from './components/TextEditor';
import MediaUploader from './components/MediaUploader';
import ValidationPanel from './components/ValidationPanel';
import PreviewPanel from './components/PreviewPanel';
import HistoryPanel from './components/HistoryPanel';
import './App.css';

/**
 * PostFlow — Dynamic Multi-Platform Post Composer
 *
 * Main application component orchestrating the post composition workflow:
 * 1. Platform selection
 * 2. Text editing with real-time character counting
 * 3. Media attachment
 * 4. Validation feedback
 * 5. Live preview
 * 6. Post history with reuse & delete
 */
export default function App() {
  const { history, addToHistory, removeFromHistory, clearHistory } = useHistory();

  const {
    text,
    setText,
    selectedPlatforms,
    togglePlatform,
    setSelectedPlatforms,
    media,
    addMedia,
    removeMedia,
    validationResults,
    charInfo,
    hasErrors,
    hasWarnings,
    hashtagCount,
    canPublish,
    isSubmitting,
    submitSuccess,
    handlePublish,
    reset,
  } = usePostComposer({ onPublishSuccess: addToHistory });

  // Reuse a post from history — loads text & platforms back into composer
  const handleReuse = useCallback((item) => {
    setText(item.text);
    setSelectedPlatforms(item.platforms);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setText, setSelectedPlatforms]);

  return (
    <div className="app" id="app-root">
      {/* Header */}
      <header className="app-header" id="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <div className="app-header__logo" id="app-logo">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="url(#logo-grad)" />
                <path d="M8 14l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="logo-grad" x1="0" y1="0" x2="28" y2="28">
                    <stop stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="app-header__title">PostFlow</h1>
            <span className="app-header__badge">Composer</span>
          </div>
          <div className="app-header__actions">
            <button
              className="btn btn--ghost"
              onClick={reset}
              id="btn-reset"
              aria-label="Reset composer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.05 10A6 6 0 1014 8a6 6 0 00-11-3.37L2 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main" id="app-main">
        <div className="app-layout">
          {/* Left Column — Composer */}
          <div className="app-column app-column--composer">
            <div className="card" id="card-platforms">
              <PlatformSelector
                selectedPlatforms={selectedPlatforms}
                onToggle={togglePlatform}
              />
            </div>

            <div className="card" id="card-editor">
              <TextEditor
                text={text}
                setText={setText}
                selectedPlatforms={selectedPlatforms}
                charInfo={charInfo}
              />
            </div>

            <div className="card" id="card-media">
              <MediaUploader
                media={media}
                onAddMedia={addMedia}
                onRemoveMedia={removeMedia}
                selectedPlatforms={selectedPlatforms}
              />
            </div>

            {/* Publish Button */}
            <div className="publish-area" id="publish-area">
              {submitSuccess ? (
                <div className="publish-success" id="publish-success">
                  <div className="publish-success__icon">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="16" r="14" fill="url(#success-grad)" />
                      <path d="M10 16l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <defs>
                        <linearGradient id="success-grad" x1="0" y1="0" x2="32" y2="32">
                          <stop stopColor="#10b981" />
                          <stop offset="1" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <span className="publish-success__text">
                    Published successfully to {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}!
                  </span>
                </div>
              ) : (
                <button
                  className={`btn btn--publish ${!canPublish ? 'btn--disabled' : ''}`}
                  onClick={handlePublish}
                  disabled={!canPublish}
                  id="btn-publish"
                  aria-label="Publish post"
                >
                  {isSubmitting ? (
                    <>
                      <span className="btn-spinner" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M16 2L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 2l-5 14-3-6-6-3 14-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Publish{selectedPlatforms.length > 0 ? ` to ${selectedPlatforms.length} Platform${selectedPlatforms.length !== 1 ? 's' : ''}` : ''}
                    </>
                  )}
                </button>
              )}

              {!canPublish && !submitSuccess && selectedPlatforms.length > 0 && text.trim().length > 0 && hasErrors && (
                <p className="publish-hint" id="publish-hint-error">
                  Fix validation errors before publishing
                </p>
              )}
              {!canPublish && !submitSuccess && selectedPlatforms.length === 0 && (
                <p className="publish-hint" id="publish-hint-platform">
                  Select at least one platform to publish
                </p>
              )}
              {!canPublish && !submitSuccess && selectedPlatforms.length > 0 && text.trim().length === 0 && (
                <p className="publish-hint" id="publish-hint-text">
                  Write some content to publish
                </p>
              )}
            </div>
          </div>

          {/* Right Column — Preview & Validation */}
          <div className="app-column app-column--sidebar">
            <div className="card" id="card-preview">
              <PreviewPanel
                text={text}
                selectedPlatforms={selectedPlatforms}
                media={media}
              />
            </div>

            <div className="card" id="card-validation">
              <ValidationPanel
                validationResults={validationResults}
                selectedPlatforms={selectedPlatforms}
                hashtagCount={hashtagCount}
              />
            </div>

            <div className="card" id="card-history">
              <HistoryPanel
                history={history}
                onReuse={handleReuse}
                onRemove={removeFromHistory}
                onClear={clearHistory}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer" id="app-footer">
        <p>PostFlow Composer — Multi-Platform Post Creation Interface</p>
      </footer>
    </div>
  );
}
