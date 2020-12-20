#Projekt quizu na zaliczenie
v. 0.4.3

####TODO:
* Dokumentacja - in progress
* Ekran końcowy
* Nowy layout
* Osobny JSON z tekstami

####Changelog:
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
