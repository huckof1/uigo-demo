# UI UX PREMIUM

## Цель визуального стиля

UiGo должен ощущаться как нативное премиальное мобильное приложение для iPhone: чистое, быстрое, тактильное, с мягкой глубиной и живыми переходами. MVP проектируется под Expo/React Native и тестируется в Expo Go на iPhone 11.

Не проектировать UI как веб-приложение. Не использовать web-only компоненты, hover-паттерны, desktop layout или веб-модалки.

## Mobile-first правила

- Основной сценарий: portrait mode на iPhone 11.
- Все важные действия доступны одной рукой.
- Safe area сверху и снизу обязательна.
- Bottom navigation и bottom sheets не должны попадать под home indicator.
- Текст и кнопки должны быть читаемыми на 6.1-inch экране iPhone 11.
- Списки должны использовать `FlatList`, `SectionList` или другие RN-friendly решения.
- Touch target для основных действий должен быть не меньше 44x44 pt.

## Expo Go compatibility

Разрешено для MVP в Expo Go:

- Expo Router или React Navigation.
- React Native Reanimated, если используется версия, совместимая с текущим Expo SDK.
- React Native Gesture Handler.
- `@gorhom/bottom-sheet`, если совместим с версией Reanimated/Gesture Handler в проекте.
- `expo-blur` для BlurView/glass panels.
- `expo-haptics` для haptic feedback.
- `react-native-safe-area-context`.
- `react-native-webview` для возможной 2GIS MapGL JS интеграции.

Требует отдельной проверки или development build:

- Нативный 2GIS iOS/Android SDK.
- Любая библиотека с custom native code, которой нет в Expo Go.
- Любые изменения native project config, которые Expo Go не содержит.
- Продвинутые map features, если они требуют нативного SDK.

## Liquid glass через BlurView

Liquid glass реализуется через `BlurView`, полупрозрачные RN `View`, границы, мягкие тени и аккуратную цветовую подложку.

Использование:

- bottom navigation;
- floating panels над картой;
- status panels;
- owner quick actions;
- sheet headers;
- compact filters.

Правила:

- На iOS blur может быть основным эффектом.
- На Android предусматривать fallback через translucent background, потому что качество blur может отличаться.
- Не накладывать много BlurView друг на друга.
- Не блюрить большие full-screen области без необходимости.

## Native-like bottom sheets

Bottom sheets - главный паттерн взаимодействия.

Использование:

- превью квартиры;
- подробности объекта;
- отправка заявки;
- срочная заявка;
- предложение другого времени;
- фильтры;
- действия владельца.

Требования:

- snap points: compact, half, full.
- drag handle обязателен.
- жест закрытия вниз.
- haptic feedback при важных snap/action.
- sheet должен учитывать safe area и клавиатуру.
- внутри sheet использовать scrollable content без конфликта с drag gesture.

## Modal sheets вместо web modal windows

В мобильном MVP подтверждения и формы должны быть modal sheets, а не веб-модалки по центру экрана.

Примеры:

- отменить заявку;
- отклонить заявку;
- отправить срочную заявку;
- предложить другое время;
- завершить показ;
- отметить неявку.

Критичные действия требуют confirmation sheet с коротким текстом и двумя действиями.

## React Native Reanimated animations

Анимации должны выполняться плавно и не блокировать JS thread.

Использование:

- открытие и закрытие sheet;
- появление карточек;
- press scale;
- favorite pop;
- status badge transition;
- urgent pulse;
- skeleton shimmer;
- toast entrance;
- map marker selection.

Рекомендации:

- Использовать shared values и worklets для gesture-driven UI.
- Не делать тяжелые бесконечные анимации поверх карты.
- Уважать reduced motion, если это будет доступно в системных настройках.
- На iPhone 11 целиться в стабильные 60 FPS для основных gestures.

## Haptic feedback через expo-haptics

Haptics используется как короткое подтверждение:

- отправка заявки;
- принятие заявки;
- добавление в избранное;
- snap важного sheet-состояния;
- ошибка формы;
- успешное подтверждение времени.

Не использовать haptics на каждом tap. Частая вибрация делает интерфейс дешевым и раздражающим.

## Skeleton и shimmer loading

Skeleton loading нужен для:

- карточек квартир;
- списка заявок;
- чата;
- отзывов;
- панели владельца.

Shimmer должен быть мягким и коротким. Если список большой, shimmer не должен анимировать десятки элементов одновременно.

## Animated map markers

Маркеры должны быть реализуемы в выбранной карте:

- выбранный маркер увеличивается;
- срочный/горячий объект может иметь легкий pulse;
- цена или короткий label читаемы;
- кластеризация не должна перегружать iPhone 11.

Если 2GIS реализуется через WebView/MapGL, анимация маркеров может жить внутри WebView. React Native должен получать событие выбора маркера через bridge/message.

Если используется нативный 2GIS SDK, требуется development build/dev client.

## Floating action buttons

FAB используется ограниченно:

- вернуться к текущей геолокации;
- создать объект владельцу;
- открыть быстрый сценарий заявки в подходящем контексте.

FAB должен быть над safe area и не конфликтовать с bottom navigation или sheet.

## Swipe gestures

Жесты:

- тянуть sheet вверх/вниз;
- свайпать фото объекта;
- свайпать уведомления;
- свайпать карточки избранного;
- закрывать non-critical sheet вниз.

Критичные действия не выполняются только свайпом без подтверждения.

## Live status badges

Статусы заявок отображаются нативными badge-компонентами:

- ожидание: нейтральный;
- срочно: акцентный, но не агрессивный;
- принято: положительный;
- отклонено/отменено: приглушенный;
- показ идет: живой индикатор;
- завершено: спокойный финальный.

Badge должен объяснять, почему доступны именно эти действия.

## Карточка объекта

Карточка объекта в React Native должна включать:

- фото через `Image`/`expo-image` после выбора библиотеки;
- цену;
- адрес или район;
- параметры;
- рейтинг или отзывы;
- кнопку избранного;
- CTA обычной заявки;
- CTA срочной заявки, если доступно.

Карточка используется внутри sheet и в списках. Она не должна быть web card с hover-состояниями.

## Owner mobile panel

Панель владельца должна быть легкой:

- список заявок;
- статус;
- максимум 2-3 основных действия на карточку;
- дополнительные действия прятать в sheet;
- не делать admin dashboard.

## Empty, error, success states

Empty state:

- нет избранного;
- нет заявок;
- нет сообщений;
- у владельца нет объектов;
- по карте ничего не найдено.

Error state:

- карта не загрузилась;
- геолокация недоступна;
- заявка устарела;
- владелец уже изменил статус;
- сообщение не отправилось.

Success state:

- заявка отправлена;
- время подтверждено;
- объект сохранен;
- показ завершен;
- отзыв опубликован.

На мобильном экране эти состояния должны быть короткими, с одним следующим действием.

## iPhone 11 safe area checklist

- Root wrapped in `SafeAreaProvider`.
- Screens use `useSafeAreaInsets` or safe-area-aware wrappers.
- Bottom navigation has bottom padding for home indicator.
- Bottom sheets account for bottom inset.
- Header content does not залезать под notch/status bar.
- Keyboard-aware forms for заявки, чат, профиль и создание объекта.
- Map controls avoid notch and home indicator.
