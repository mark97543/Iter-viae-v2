``` mermaid
graph TD

    A[User Clicks Delete Trip] --> B{Warning Messege: <br> Are you Sure?</br>}
    B -- No --> C[Cancel]
    B -- Yes --> D2{Check if Selected File is currentone} 
    D2 -- Yes --> D3[Clear the current gui Items] -->D
    D2 -- No --> D[Call Rust Delete Function]
    D --> E[Pull Fresh File List and Update UI]


```


