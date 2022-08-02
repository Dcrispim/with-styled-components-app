import { Axios } from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { TitleType } from "../types";
import styled from "styled-components";

// import { Container } from './styles';

const Home: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [excludeText, setExcludeText] = useState("");
  const [total, setTotal] = useState(0);

  const [capH, setCapH] = useState(0);
  const [capL, setCapL] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [titles, setTitles] = useState<TitleType[]>([]);

  const listRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    let listTitles: TitleType[] = [];

    const searchTerms = searchText?.split(",");
    const excludeTerms = excludeText?.split(",");

    axios
      .get<TitleType[]>(
        `/api/list?title=${searchText}&no_title=${excludeTerms}&tags=${searchText}` +
          `&no_tags=${excludeTerms}&description=${searchText}&no_description=${excludeTerms}` +
          `&min_chap=${capL}&max_chap=${
            capH || 100000
          }&page=${pageNumber}&limit=${pageSize}`
      )
      .then((resp) => {
        console.log(resp);
        setTitles(resp.data.titles);
        setTotal(resp.data.total);
      });
  };

  useEffect(()=>{

    handleSearch()
  },[pageSize,pageNumber])

  const handleNext = () => {
    setPageNumber((p) => (titles.length > 0 ? p + 1 : p));
    listRef.current.scrollTo(0, 0);
  };
  const handleBack = () => {
    listRef.current.scrollTo(0, 0);
    setPageNumber((p) => (p > 1 ? p - 1 : 1));
  };

  return (
    <div>
      <div>
        <input
          value={searchText}
          onChange={(e) => {
            setSearchText(e?.currentTarget.value);
          }}
        />
        <input
          value={excludeText}
          onChange={(e) => {
            setExcludeText(e?.currentTarget.value);
          }}
        />
        <input
          value={capL}
          type="number"
          onChange={(e) => {
            setCapL(parseInt(e?.currentTarget.value || "0"));
          }}
        />
        <input
          value={capH}
          type="number"
          onChange={(e) => {
            setCapH(parseInt(e?.currentTarget.value || "0"));
          }}
        />
        <div>
          <button onClick={handleSearch}>Search</button>
        </div>

        <p>
          <label>{total}</label> {"  "}
          <b>
            <span>
              {pageNumber} / {(total / pageSize).toFixed(0)}
            </span>
          </b>
        </p>

        <div>
          <button onClick={handleBack}>-</button>
          <span>{pageNumber}</span>
          <button onClick={handleNext}>+</button>
        </div>
      </div>
      <div
        ref={listRef}
        style={{
          overflowY: "scroll",
          maxHeight: 800,
        }}
      >
        {titles.map((title) => {
          return (
            <ListContainer key={title.title}>
              <div className="image-thumb mb-2">
                <img src={title.thumb} alt={title.title} width="150" />
              </div>
              <div className="description">
                <h3>
                  <a href={title.link} target="_blank" rel="noreferrer">
                    {title.title}
                  </a>
                  {" ==>"}
                  <b>{title.chapters}</b>
                </h3>
                <p>{title.description}</p>
                <div>
                  {title.tags.map((tag) => (
                    <span> {tag} </span>
                  ))}
                </div>
              </div>
            </ListContainer>
          );
        })}
      </div>
    </div>
  );
};

export default Home;

const ListContainer = styled.div`
  display: flex;
  flex-direction: row;

  div.description {
    margin-left: 20px;
  }
  div.image-thumb {
    display: flex;
    flex-direction: column;
    width: 250px;
  }
`;
