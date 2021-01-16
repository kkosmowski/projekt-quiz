# Projekt quizu na zaliczenie
v. 0.6.4

#### TODO:
* Dokumentacja - in progress
* Ekran końcowy - in progress
* Nowy layout

#### Changelog:
* 0.6.4:
  * dodane statystyki odpowiedzi na konkretne kategorie w ekranie końcowym;
  * dodane przetrzymywanie informacji jakiej kategorii jest każde pytanie;
  * poprawiony parser kodu;
* 0.6.1
  * teksty przenisione do pliku z translacjami;
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
