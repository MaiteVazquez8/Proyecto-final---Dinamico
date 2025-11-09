# ElectroShop - Guía de Estilos y Colores

## Paleta de Colores Principal

### Colores Base
- **Azul Oscuro** (`#333446`): Color principal para encabezados, texto importante y elementos de navegación
- **Azul Medio** (`#7F8CAA`): Color secundario para elementos destacados y hover states
- **Verde Suave** (`#B8CFCE`): Color de acento para botones de acción y elementos interactivos
- **Gris Claro** (`#EAEFEF`): Color de fondo principal y elementos neutros

### Degradados y Variaciones

#### Azul (Confianza y Estabilidad)
```css
--color-blue-lightest: #F0F0F4
--color-blue-lighter: #D6D6E1
--color-blue-light: #BBBCCE
--color-blue-medium-light: #A0A2BA
--color-blue-medium: #8687A7
--color-blue-medium-dark: #6B6D94
--color-blue-dark: #585979
--color-blue-darker: #45465F
--color-blue-darkest: #1E1F29
--color-blue-black: #0B0B0F
```

#### Verde (Paz y Armonía)
```css
--color-green-lightest: #F0F5F4
--color-green-lighter: #D5E2E1
--color-green-light: #B8CFCE
--color-green-medium-light: #9EBDBB
--color-green-medium: #83AAA8
--color-green-medium-dark: #679895
--color-green-dark: #557C7A
--color-green-darker: #426160
--color-green-darkest: #304645
--color-green-black: #1D2A2A
```

## Uso de Colores

### Fundamentos de Diseño

1. **Azul Oscuro** - Usado para:
   - Encabezados principales
   - Navegación
   - Texto importante
   - Elementos que requieren confianza y profesionalismo

2. **Azul Medio** - Usado para:
   - Estados hover
   - Elementos secundarios
   - Iconos y detalles
   - Complemento del azul oscuro

3. **Verde Suave** - Usado para:
   - Botones de acción (CTA)
   - Estados de éxito
   - Elementos destacados
   - Detalles del logo y marca

4. **Gris Claro** - Usado para:
   - Fondo principal
   - Espacios en blanco
   - Contenedores neutros
   - Mejora la legibilidad

## Archivos de Estilos

### `variables.css`
Contiene todas las variables CSS personalizadas con la paleta de colores, espaciado, tipografía y efectos.

### `global.css`
Estilos globales que aplican la paleta de colores a elementos comunes como botones, formularios, cards, etc.

## Clases Utilitarias

### Colores de Texto
- `.text-primary` - Color azul oscuro principal
- `.text-secondary` - Color azul medio
- `.text-accent` - Color verde suave
- `.text-muted` - Color azul medio claro

### Colores de Fondo
- `.bg-primary` - Fondo azul oscuro
- `.bg-secondary` - Fondo azul medio
- `.bg-accent` - Fondo verde suave
- `.bg-light` - Fondo gris claro
- `.bg-surface` - Fondo azul muy claro

### Botones
- `.btn-primary` - Botón principal (azul oscuro)
- `.btn-secondary` - Botón secundario (borde azul oscuro)
- `.btn-accent` - Botón de acción (verde suave)

## Mejores Prácticas

1. **Consistencia**: Usar siempre las variables CSS en lugar de valores hardcodeados
2. **Contraste**: Asegurar suficiente contraste para accesibilidad
3. **Jerarquía**: Usar colores más oscuros para elementos más importantes
4. **Estados**: Aplicar variaciones de color para hover, focus y active states
5. **Responsive**: Los colores deben funcionar bien en todos los tamaños de pantalla

## Accesibilidad

- Contraste mínimo de 4.5:1 para texto normal
- Contraste mínimo de 3:1 para texto grande
- Estados de focus claramente visibles
- Colores no como único indicador de información

## Importación

Para usar los estilos en tu componente:

```css
@import '../../styles/variables.css';
@import '../../styles/global.css';
```

O en JavaScript:
```javascript
import '../../styles/variables.css';
import '../../styles/global.css';
```