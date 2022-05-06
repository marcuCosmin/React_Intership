import React, {useState, useEffect} from 'react';
import styles from './Main.module.css';
import Column from './Column';
import Loader from './Loader';

export default function Main() {

    const [cards, setCards] = useState([]);
    const [fetchFinished, setFetchFinished] = useState(false);

    useEffect(function() {
        fetch("https://swapi.dev/api/people/?format=json").then(raw => raw.json()).then(function(resp) {
            const dummyCards = [];
            for (const r of resp.results) {
                if (dummyCards.some(el => el.world === r.homeworld)) {
                    dummyCards[dummyCards.findIndex(el => el.world === r.homeworld)].heroes.push(r);
                } else {
                    dummyCards.push({world: r.homeworld, heroes: [r]});
                }
            }
            for (const d of dummyCards) {
                for (const index in d.heroes) {
                    const copy = d.heroes.slice();
                    copy.splice(index, 1);
                    const foundElement = copy.findIndex(el => el.name === d.heroes[index].name);
            
                    if (foundElement !== -1) {
                        copy.splice(foundElement, 1);
                        d.heroes[index] = copy;
                    }
                }
            }
            setFetchFinished(true);
            setCards(dummyCards);
        });
    }, []);
  return (
        <ul className={(cards.length > 0 && fetchFinished) ? styles.list : 'd-flex justify-content-center align-items-center mt-5'}>
            {(cards.length > 0 && fetchFinished) ? cards.map((element, index) => <Column link={element.world} heroes={element.heroes} key={index}/>) : <Loader/>}
        </ul>
  )
}
