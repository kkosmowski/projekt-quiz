# Projekt quizu na zaliczenie
v. 0.7.6

## Cel quizu
#### Sprawdzenie wiedzy użytkownika
Pierwszym, oczywistym celem stworzonego quizu jest sprawdzenie wiedzy z zakresu języków HTML, CSS oraz Javascript
osób biorących w nim udział.

Quiz jest skonstruowany tak, że przy odpowiednio dużej liczbie pytań z kategorii oraz przy rozsądnej liczbie
zadanych pytań może być wielokrotnie rozwiązywany. Powodem tego jest losowość pytań oraz odpowiedzi.

#### Poszerzenie wiedzy i umiejętności autora
Niezaprzeczalnym pozytywem stworzenia quizu jest odświeżenie i poszerzenie wiedzy z zakresu fundamentów tworzenia stron
internetowych przez autora. Nowe doświadczenie w rozwiązywaniu problemów również zostało pozyskane.

## Uproszczony opis działania quizu
* 0 - Brak stanu
  w momencie ładowania strony następuje automatyczna inicjalizacja quizu;
* 1 - Obecny stan: `pre-start`
  * inicjalizacja quizu kończy się przedstawieniem ekranu startowego, zawierającego kluczowe informacje o quizie i przycisk umożlwiający start.
* 2 - Po kliknięciu przycisku "Start", stan: `in-progress`
  * pobrana zostaje baza pytań, następuje wylosowanie danej liczby pytań i wyświetlenie pierwszej porcji na stronie pierwszej.
  * oprócz pierwszej strony wyrenderowane zostają kontrolki do obsługi quizu oraz indykatory pytań.
  * po kliknięciu kontrolki "Kontynuuj" zostanie pokazana następna strona, zawierająca kolejną porcję pytań.
  * po kliknięciu kontrolki "Cofnij" zostanie pokazana poprzednia strona, nie będzie ona jednak na nowo tworzona, ponieważ istnieje już w DOM.
    * po ponownym kliknięciu kontrolki "Kontynuuj" również strona nie będzie na nowo renderowana, jeżeli została już raz wyświetlona.
  * na ostatniej stronie kontrolka "Kontynuuj" służy do zakończenia quizu.
* 3 - Po kliknięciu przycisku "Zakończ", stan: `finished`
  * wyświetlony zostaje ekran końcowy, przedstawiający wynik i statystyki podzielone na kategorie (języki).
  * dostępne są dwa przyciski: "Przejrzyj odpowiedzi" (4) oraz "Spróbuj ponownie" (5).
* 4 - Po kliknięciu przycisku "Przejrzyj odpowiedzi", stan: `reviewing`
  * wyświetlona zostaje pierwsza strona z pytaniami, jednak nie ma już możliwości wyboru odpowiedzi.
  * dodatkowo zostają wyświetlone indykatory pokazujące poprawną odpowiedź, wybraną odpowiedź oraz wyjaśnienie (jeżeli jest potrzeba).
  * zostaje wyświetlona nowa kontrolka - "Uruchom ponownie".
* 5 - Po kliknięciu przycisku "Spróbuj ponownie" (ekran końcowy) bądź "Uruchom ponownie" (przegląd odpowiedzi), stan: `restarted`
  * quiz zostaje zrestartowany, następuje reinicjalizacja i automatyczne rozpoczęcie quizu z nowymi pytaniami -> (2)
  
---

#### To do:
* dodać link z wyjaśnieniami w trybie przeglądania;
* dodać opcjonalność wyjaśnienia (nie każde pytanie go potrzebuje);
* naprawić błąd na ostatniej stronie kiedy pytań jest mniej niż `questionsPerPage`;
* przeredagować pytania CSS;
* dodać pytania Javascript;

#### Changelog:
* 0.7.6: 
  * przeredagowane pytania i odpowiedzi HTML, a także dodane wyjaśnienia i linki; 
* 0.7.5:
  * stopnie trudności są teraz brane pod uwagę;
  * ilość wylosowanych pytań jest teraz poprawna;
  * przygotowanie kontrolek wykonywane jest teraz dopiero po załadowaniu pytań;
  * poprawiony błąd w instrukcji (ilość pytań przypadających na stopień trudności;
  * progress boxy ukrywają się teraz kiedy szerokość ekranu będzie poniżej 1000px;
* 0.7.2:
  * dynamiczna instrukcja, zmienia się w zależności od ilości pytań i kategorii;
* 0.7.1:
  * przywrócono oznaczenia pytań utracone w wersji 0.7.0;
  * w statystykach pojawiają się tylko kategorie, z których pytania zostały wylosowane;
* 0.7.0:
  * zaktualizowano i uzupełniono dokumentację;
  * znacząco uporządkowany kod;
  * dodany cel quizu oraz uproszczony opis działania;
  * drobne poprawki w kodzie;
* 0.6.4:
  * dodane statystyki odpowiedzi na konkretne kategorie w ekranie końcowym;
  * dodane przetrzymywanie informacji jakiej kategorii jest każde pytanie;
  * poprawiony parser kodu;
* 0.6.1
  * teksty przeniesione do pliku z translacjami;
  * metoda `interpolate()` dla tłumaczenia tekstów z zawartymi zmiennymi;
* 0.6.0
  * dodano stan przeglądu wyników;
  * dodano ekran przeglądu wyników;
  * usunięcia nasłuchiwania kontrolek dopiero przed wyczyszczeniem quizu;
  * usprawnienia działania metody `changePage()`;
  * poprawione pobieranie odpowiedzi użytkownika;
  * znaczące poprawki w pobieraniu quizu (server.py już niepotrzebny);
* 0.5.0
  * dodano ekran końcowy i wyliczanie wyniku;
  * dodano procent wymagany do zaliczenia quizu;
  * dodano obsługę em dash i en dash;
  * dodano nowe pytanie html;
  * drobne poprawki w pytaniach;
  * spory code cleanup dla poprawy czytelności;
* 0.4.7
  * poprawa części pytań i odpowiedzi;
  * dodano odpowiedzi do kilku pytań;
  * dodano kilka wytłumaczeń do pytań;
  * dodano nowe pole w bazie pytań, z linkiem do dalszej lektury;
* 0.4.5
  * dodano kolejną część dokumentacji;
  * usunięte zbędne litery odpowiedzi;
  * drobna zmiana w metodzie tworzenia odpowiedzi;
  * code cleanup;
* 0.4.3
  * częściowa dokumentacja;
  * tworzenie indykatorów postępu wyniesione do osobnej metody;
* 0.4.1
  * nowe metody Base: addClass i removeClass;
  * optymalizacja zmiany stanu progressBoxów;
* 0.4.0
  * dodano podział na moduły Javascript;
  * dodano moduł Render;
  * dodano moduł Base;
* 0.3.0
  * odpowiedzi są teraz w losowej kolejności;
  * dodano tracking odpowiedzi i postępu odpowiedzi na stronie;
  * dodano walidację przycisku Kontynuuj;
  * refactor zarządzania stanem przycisków;
* 0.2.0
  * system zmiany strony ukończony;
  * dodano "cacheowanie" stron, tj. każdą z nich tylko raz tworzymy, potem tylko chowamy i pokazujemy;
  * rozwiązany problem zapisywania pytań w celu powrotu do strony;
  * indykatory strony w pełni sprawne;
* 0.1.8
  * dodane kontrolki quizu;
  * częściowo zaimplementowany system zmiany strony;
  * częściowo zaimplementowane indykatory strony i/lub postępu;
  * poprawione style wyświetlania odpowiedzi;
  * drobna zmiana tytułu instrukcji; 
* 0.1.6
  * dodano pytania CSS do bazy pytań;
* 0.1.5
  * zmiana notacji kodu liniowego i blokowego;
* 0.1.4
  * paginacja częściowo zaimplementowana;
  * code cleanup; 
* 0.1.3
  * ładowanie pytań i ich losowość;
  * poprawki w inputach odpowiedzi;
  * dodane improvementy UX/UI;
* 0.1.2
  * dodano częściową implementację ładowania pytań;   
  * dodano nowe pytania (css);
  * zmieniono strukturę JSONa z pytaniami (lista pytań => encje pytań);
  * dodano obsługę przez http server (localhost:8000);
* 0.1.0
  * dodano ekran startowy oraz instrukcję;
  * dodano stany quizu;
  * zaimplementowany podstawowy styl przycisków;
* 0.0.2
  * dodano blokowy `<code>`;
  * poprawiono style `<code>` i odpowiedzi;
  * delikatne poprawki stylu elementu `.quiz`.
