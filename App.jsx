
import React, { useState } from "react";

export default function App() {
  const [pincode, setPincode] = useState("");
  const [postOffices, setPostOffices] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleLookup(event) {
    event.preventDefault();

    setError("");
    setPostOffices([]);
    setFilter("");
    setSearched(true);

    if (!/^\d{6}$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to fetch postal data. Please try again."
        );
      }

      const result = await response.json();
      const data = result?.[0];

      if (!data) {
        throw new Error("Invalid response received from the server.");
      }

      if (data.Status !== "Success" || !Array.isArray(data.PostOffice)) {
        setError(
          data.Message || "No postal data found for this pincode."
        );
        return;
      }

      if (data.PostOffice.length === 0) {
        setError("No post offices found for this pincode.");
        return;
      }

      setPostOffices(data.PostOffice);
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong. Please check your internet connection."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredOffices = postOffices.filter((office) =>
    office.Name.toLowerCase().includes(filter.trim().toLowerCase())
  );

  return (
    <main className="app-container">
      <header className="top-header">
        <a className="brand" href="/" aria-label="Pincode Lookup home">
          <span className="brand-icon">P</span>
          <span>Pincode Finder</span>
        </a>
        <span className="country-label">INDIA POST</span>
      </header>

      <section className="hero">
        <div className="eyebrow">
          <span className="eyebrow-dot"></span>
          INDIAN POSTAL DIRECTORY
        </div>

        <h1>
          Find your post office
          <br />
          <span>in seconds.</span>
        </h1>

        <p className="hero-description">
          Enter a 6-digit Indian pincode to discover post offices,
          districts, and states.
        </p>

        <form className="search-form" onSubmit={handleLookup}>
          <div className="pincode-input-wrapper">
            <span className="search-icon" aria-hidden="true">
              ⌕
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              aria-label="Six-digit Indian pincode"
              placeholder="Enter 6-digit pincode"
              value={pincode}
              onChange={(event) => {
                setPincode(
                  event.target.value.replace(/\D/g, "").slice(0, 6)
                );
                setError("");
              }}
            />
          </div>

          <button
            className="lookup-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Searching..." : "Lookup"}
            {!loading && <span aria-hidden="true"> →</span>}
          </button>
        </form>

        <p className="helper-text">
          <span aria-hidden="true">ⓘ</span> Enter all 6 digits to
          search the postal directory.
        </p>
      </section>

      <section className="results-section" aria-live="polite">
        {loading && (
          <div className="loading-panel">
            <div className="spinner"></div>
            <h2>Finding post offices...</h2>
            <p>Please wait while we fetch the postal details.</p>
          </div>
        )}

        {!loading && error && (
          <div className="message-panel error-panel" role="alert">
            <div className="message-icon">!</div>
            <h2>Unable to find postal details</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && postOffices.length > 0 && (
          <>
            <div className="results-heading">
              <div>
                <p className="section-label">SEARCH RESULTS</p>
                <h2>Post offices found</h2>
                <p className="result-count">
                  {filteredOffices.length} of {postOffices.length}{" "}
                  post offices
                </p>
              </div>

              <div className="pincode-badge">
                PIN {pincode}
              </div>
            </div>

            <div className="filter-wrapper">
              <span className="filter-icon" aria-hidden="true">
                ⌕
              </span>
              <input
                type="text"
                aria-label="Filter by post office name"
                placeholder="Filter by post office name..."
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              />

              {filter && (
                <button
                  type="button"
                  className="clear-filter"
                  onClick={() => setFilter("")}
                  aria-label="Clear post office filter"
                >
                  ×
                </button>
              )}
            </div>

            {filteredOffices.length > 0 ? (
              <div className="office-grid">
                {filteredOffices.map((office, index) => (
                  <article
                    className="office-card"
                    key={`${office.Name}-${office.Pincode}-${index}`}
                  >
                    <div className="office-card-top">
                      <div className="office-icon">✉</div>
                      <span className="office-tag">
                        {office.BranchType || "Post Office"}
                      </span>
                    </div>

                    <h3>{office.Name}</h3>

                    <div className="office-info">
                      <div className="info-row">
                        <span>Pincode</span>
                        <strong>{office.Pincode}</strong>
                      </div>

                      <div className="info-row">
                        <span>District</span>
                        <strong>{office.District || "N/A"}</strong>
                      </div>

                      <div className="info-row">
                        <span>State</span>
                        <strong>{office.State || "N/A"}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="message-panel empty-panel">
                <div className="message-icon">⌕</div>
                <h2>No matching post offices</h2>
                <p>
                  Couldn’t find the postal data you’re looking for…
                </p>
                <button
                  type="button"
                  className="reset-button"
                  onClick={() => setFilter("")}
                >
                  Clear filter
                </button>
              </div>
            )}
          </>
        )}

        {!loading && !error && postOffices.length === 0 && !searched && (
          <div className="empty-state">
            <div className="empty-illustration">⌖</div>
            <h2>Your postal search starts here</h2>
            <p>
              Search by pincode to see post office names, districts,
              and state details.
            </p>
          </div>
        )}
      </section>

      <footer className="page-footer">
        <p>Postal information powered by India Post Pincode API.</p>
      </footer>
    </main>
  );
}
