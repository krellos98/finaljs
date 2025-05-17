const URL_API = "https://mindicador.cl/api";

const inputCLP = document.getElementById("valorCLP");
const selectMoneda = document.getElementById("selectorMoneda");
const parrafoResultado = document.getElementById("respuestaConversion");
const botonConvertir = document.getElementById("btnConvertir");
const canvas = document.getElementById("chartMoneda").getContext("2d");

let miGrafico = null;


async function obtenerMonedas() {
  try {
    const res = await fetch(URL_API);
    const data = await res.json();

    const disponibles = ["dolar", "euro"];

    disponibles.forEach(moneda => {
      const opcion = document.createElement("option");
      opcion.value = moneda;
      opcion.textContent = data[moneda].nombre;
      selectMoneda.appendChild(opcion);
    });
  } catch (e) {
    parrafoResultado.textContent = `No se pudo cargar las monedas: ${e.message}`;
  }
}

async function hacerConversion() {
  const cantidad = parseFloat(inputCLP.value);
  const tipoMoneda = selectMoneda.value;

  if (!cantidad || !tipoMoneda) {
    parrafoResultado.textContent = "Complete el monto y seleccione una moneda.";
    return;
  }

  try {
    const respuesta = await fetch(`${URL_API}/${tipoMoneda}`);
    const info = await respuesta.json();

    const valorHoy = info.serie[0].valor;
    const resultado = (cantidad / valorHoy).toFixed(2);

    parrafoResultado.textContent = `Equivalente: ${resultado} ${info.nombre}`;
    generarGrafico(info);

  } catch (error) {
    parrafoResultado.textContent = `Error en la conversión: ${error.message}`;
  }
}

function generarGrafico(datos) {
  const ultimos10 = datos.serie.slice(0, 10).reverse();
  const fechas = ultimos10.map(d => d.fecha.split("T")[0]);
  const valores = ultimos10.map(d => d.valor);

  if (miGrafico) miGrafico.destroy();

  miGrafico = new Chart(canvas, {
    type: "line",
    data: {
      labels: fechas,
      datasets: [{
        label: `Últimos 10 días (${datos.nombre})`,
        data: valores,
        borderColor: "#00cfff",
        backgroundColor: "rgba(0, 207, 255, 0.2)",
        borderWidth: 2,
        fill: true
      }]
    }
  });
}


botonConvertir.addEventListener("click", hacerConversion);
obtenerMonedas();
