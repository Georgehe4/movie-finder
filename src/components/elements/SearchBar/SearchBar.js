import React, { useState, useCallback } from "react";
import FontAwesome from "react-fontawesome";
import "./SearchBar.css";

import { debounce } from "lodash";

export default function SearchBar({ callback, wait = 500 }) {
  const [searchValue, setSearchValue] = useState("");
  const [startDateValue, setStartDateValue] = useState("");
  const [endDateValue, setEndDateValue] = useState("");

  const debouncedCallback = useCallback(debounce(v => callback(searchValue, startDateValue, endDateValue), wait), 
  [callback, searchValue, startDateValue, endDateValue]);
  const handleSearch = useCallback(({ target: { value: localValue }}) => {
    // this will update input field val everytime user hits key
    setSearchValue(localValue);
    debouncedCallback(localValue);
  });

  const handleStartDate = useCallback(({ target: { value: localValue }}) => {
    // this will update input field val everytime user hits key
    setStartDateValue(localValue);
    debouncedCallback(localValue);
  });

  const handleEndDate = useCallback(({ target: { value: localValue }}) => {
    // this will update input field val everytime user hits key
    setEndDateValue(localValue);
    debouncedCallback(localValue);
  });

  return (
    <div className="rmdb-searchbar">
      <div className="rmdb-searchbar-content">
        <FontAwesome className="rmdb-fa-search" name="search" size="2x" />
          <input
            type="text"
            className="rmdb-searchbar-input"
            placeholder="Search"
            onChange={handleSearch}
            value={searchValue}
          />
      </div>

      <div className="rmdb-searchbar-content">
        <FontAwesome className="rmdb-fa-search" name="search" size="2x" />
        <input
            type="date"
            className="rmdb-searchbar-input"
            placeholder="Start Date"
            onChange={handleStartDate}
            value={startDateValue}
            />
        </div>
        
        <div className="rmdb-searchbar-content">
        <FontAwesome className="rmdb-fa-search" name="search" size="2x" />
        
        <input
            type="date"
            className="rmdb-searchbar-input"
            placeholder="Start Date"
            onChange={handleEndDate}
            value={endDateValue}
          />
        </div>
    </div>
  );
}
