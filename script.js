const powerbiTemplate = `let
  Source = Web.Contents(
    "https://graphql.binnacle.mx/graphql",
    [
      Headers = [
        #"Method"="POST",
        #"Content-Type"="application/json",
        #"Authorization"="Bearer <your_personal_token_here>"
      ],
      Content = Text.ToBinary("{""query"": ""##QUERY##""}")
    ]
  ),
  #"JSON" = Json.Document(Source)
in
  #"JSON"`;

const graphqlTemplate = (powerbiQuery) => {
  const json = Json.Document(powerbiQuery, true); // Preservar formato
  const steps = json.Expression.Queries[0].Steps;
  const contentString = steps[0].Content; // Suponiendo que el primer paso define el contenido

  // Extraer la cadena de consulta usando expresiones regulares o análisis
  const queryMatch = contentString.match(/\{.*?"query":\s*"(.*?)".*\}/s); // Coincidencia de la cadena de consulta
  if (!queryMatch) {
    return "Error al extraer la consulta GraphQL de la consulta PowerBI.";
  }

  return queryMatch[1].replace(/\\"/g, '"'); // Eliminar escape de comillas
};

function generate() {
  const mode = document.querySelector('input[name="mode"]:checked').id;
  const query = document.getElementById('query').value.trim();

  let result;
  if (mode === 'mode-to-powerbi') {
    // Escape de comillas y saltos de línea en la consulta GraphQL proporcionada por el usuario
    const escapedQuery = query
      .replace(/"/g, '\\"')
      .replace(/(\r\n|\n|\r)/gm, '')
      .replace(/\s+/g, ' ');
    // Generar consulta PowerBI
    result = powerbiTemplate.replace('##QUERY##', escapedQuery);
  } else {
    // Extraer la consulta GraphQL de la estructura de consulta PowerBI proporcionada
    result = graphqlTemplate(query);
  }

  document.getElementById('result').value = result;
}

// Generar resultado inicial basado en el modo seleccionado
generate();

// Asignar un detector de eventos para cambios en la entrada para activar la regeneración
document.getElementById('query').addEventListener('input', generate);

// Manejar cambios de modo para ajustar la etiqueta de entrada y la etiqueta de resultado
const modeSelector = document.getElementById('mode-selector');
modeSelector.addEventListener('change', () => {
  const queryLabel = document.querySelector('#input-section label');
  const resultLabel = document.querySelector('#result ~ label');
  const mode = document.querySelector('input[name="mode"]:checked').id;

  if (mode === 'mode-to-powerbi') {
    queryLabel.textContent = "Ingrese el Query GraphQL (o la estructura PowerBI):";
    resultLabel.textContent = "PowerBI code (o consulta GraphQL):";
  } else {
    queryLabel.textContent = "Ingrese la estructura PowerBI (en formato JSON):";
    resultLabel.textContent = "Consulta GraphQL:";
  }
});