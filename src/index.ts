import {mergeMap, fromEvent, map, startWith, from, Observable, combineLatest, retry, merge} from 'rxjs';

const refreshButton = document.querySelector('.refresh');
const closeButton1 = document.querySelector('.close1');
const closeButton2 = document.querySelector('.close2');
const closeButton3 = document.querySelector('.close3');

const createClickStream = (el: any) => fromEvent(el, 'click');

const refreshClickStream = createClickStream(refreshButton);
const close1ClickStream = createClickStream(closeButton1);
const close2ClickStream = createClickStream(closeButton2);
const close3ClickStream = createClickStream(closeButton3);


const requestStream = refreshClickStream.pipe(
    startWith('startup click'),
    map((v) => {
        const randomOffset = Math.floor(Math.random() * 500);
        return 'https://api.github.com/users?since=' + randomOffset;
    })
);

const responseStream = requestStream.pipe(
    mergeMap((requestUrl) => from(fetch(requestUrl))),
    mergeMap((resp) => from(resp.json())),
);

function createSuggestionStream(closeClickStream: Observable<unknown>) {
    const s = combineLatest([
            closeClickStream.pipe(startWith('startup click')),
            responseStream,
        ], function (click, listUsers): any {
            return listUsers[Math.floor(Math.random() * listUsers.length)];
        }
    );
    return merge(s, refreshClickStream.pipe(map(() => null))).pipe(startWith(null))
}

const suggestion1Stream = createSuggestionStream(close1ClickStream);
const suggestion2Stream = createSuggestionStream(close2ClickStream);
const suggestion3Stream = createSuggestionStream(close3ClickStream);

// Rendering ---------------------------------------------------
function renderSuggestion(suggestedUser: any, selector: string) {
    const suggestionEl = document.querySelector(selector) as any;
    if (suggestedUser === null) {
        suggestionEl.style.visibility = 'hidden';
    } else {
        suggestionEl.style.visibility = 'visible';
        const usernameEl = suggestionEl.querySelector('.username');
        usernameEl.href = suggestedUser.html_url;
        usernameEl.textContent = suggestedUser.login;
        const imgEl = suggestionEl.querySelector('img');
        imgEl.src = "";
        imgEl.src = suggestedUser.avatar_url;
    }
}

suggestion1Stream.subscribe(function (suggestedUser) {
    renderSuggestion(suggestedUser, '.suggestion1');
});

suggestion2Stream.subscribe(function (suggestedUser) {
    renderSuggestion(suggestedUser, '.suggestion2');
});

suggestion3Stream.subscribe(function (suggestedUser) {
    renderSuggestion(suggestedUser, '.suggestion3');
});

