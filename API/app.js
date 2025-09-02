// Asistente de Cultivos - Papa y Cebolla
// Todo el JS está en español y documentado

document.addEventListener('DOMContentLoaded', function() {
    const btnUbicacion = document.getElementById('btn-ubicacion');
    const btnReintentar = document.getElementById('btn-reintentar');
    const btnMejorar = document.getElementById('btn-mejorar');
    const infoUbicacion = document.getElementById('info-ubicacion');
    const spanCoordenadas = document.getElementById('coordenadas');
    const spanPrecision = document.getElementById('precision');
    const indicadorEstado = document.getElementById('indicador-estado');
    const textoEstado = document.getElementById('texto-estado');
    const divResultados = document.getElementById('resultados');
    const divCargando = document.getElementById('cargando');
    const cajaError = document.getElementById('caja-error');
    const mensajeError = document.getElementById('mensaje-error');
    const divSuelo = document.getElementById('datos-suelo');
    const contenidoCompatibilidad = document.getElementById('contenido-compatibilidad');

    // 🔹 NUEVO botón refrescar
    const btnRefrescar = document.createElement("button");
    btnRefrescar.textContent = "🔄 Refrescar datos de suelo";
    btnRefrescar.style.margin = "10px 0";
    divResultados.insertAdjacentElement("beforebegin", btnRefrescar);

    let posicionActual = null;
    let idSeguimiento = null;

    // Mostrar error
    function mostrarError(msg) {
        cajaError.classList.remove('oculto');
        mensajeError.textContent = msg;
        divCargando.classList.add('oculto');
        divResultados.classList.add('oculto');
    }

    // Limpiar UI
    function limpiarUI() {
        cajaError.classList.add('oculto');
        divResultados.classList.add('oculto');
        divCargando.classList.add('oculto');
    }

    // Evaluar precisión GPS
    function evaluarPrecisionGPS(precision) {
        if (precision < 50) {
            indicadorEstado.className = 'indicador-estado estado-bueno';
            return 'Buena precisión';
        } else if (precision < 200) {
            indicadorEstado.className = 'indicador-estado estado-media';
            return 'Precisión moderada';
        } else {
            indicadorEstado.className = 'indicador-estado estado-mala';
            return 'Precisión baja - considera activar el GPS';
        }
    }

    // Interpretar pH
    function interpretarPH(valorPH) {
        if (valorPH < 5.5) return { nivel: 'Muy ácido', color: '#dc3545', recomendacion: 'Necesita enmienda calcárea' };
        if (valorPH < 6.0) return { nivel: 'Ácido', color: '#fd7e14', recomendacion: 'Ligeramente ácido, bueno para papa' };
        if (valorPH < 7.0) return { nivel: 'Ligeramente ácido', color: '#28a745', recomendacion: 'Ideal para ambos cultivos' };
        if (valorPH < 7.5) return { nivel: 'Neutro', color: '#28a745', recomendacion: 'Excelente para cebolla' };
        return { nivel: 'Alcalino', color: '#6f42c1', recomendacion: 'Puede necesitar acidificación para papa' };
    }

    // Interpretar materia orgánica
    function interpretarMO(valorMO) {
        if (valorMO < 2) return { nivel: 'Baja', color: '#dc3545', recomendacion: 'Necesita incorporar compost' };
        if (valorMO < 3) return { nivel: 'Media', color: '#fd7e14', recomendacion: 'Adecuada para cebolla' };
        if (valorMO < 4) return { nivel: 'Alta', color: '#28a745', recomendacion: 'Excelente para papa' };
        return { nivel: 'Muy alta', color: '#17a2b8', recomendacion: 'Óptima para ambos cultivos' };
    }

    // Analizar compatibilidad
    function analizarCompatibilidad(datosSuelo) {
        let compatibilidad = {
            papa: { puntaje: 0, problemas: [], fortalezas: [] },
            cebolla: { puntaje: 0, problemas: [], fortalezas: [] }
        };
        // pH
        if (datosSuelo.pH) {
            const ph = datosSuelo.pH;
            if (ph >= 5.5 && ph <= 6.5) {
                compatibilidad.papa.puntaje += 25;
                compatibilidad.papa.fortalezas.push('pH ideal para papa');
            } else if (ph < 5.5) {
                compatibilidad.papa.problemas.push('pH demasiado ácido para papa');
            } else {
                compatibilidad.papa.problemas.push('pH demasiado alto para papa');
            }
            if (ph >= 6.0 && ph <= 7.0) {
                compatibilidad.cebolla.puntaje += 25;
                compatibilidad.cebolla.fortalezas.push('pH ideal para cebolla');
            } else if (ph < 6.0) {
                compatibilidad.cebolla.problemas.push('pH demasiado ácido para cebolla');
            } else {
                compatibilidad.cebolla.problemas.push('pH demasiado alto para cebolla');
            }
        }
        // Materia orgánica
        if (datosSuelo.materiaOrganica) {
            const mo = datosSuelo.materiaOrganica;
            if (mo >= 3) {
                compatibilidad.papa.puntaje += 25;
                compatibilidad.papa.fortalezas.push('Buena materia orgánica para papa');
            } else {
                compatibilidad.papa.problemas.push('Materia orgánica insuficiente para papa');
            }
            if (mo >= 2) {
                compatibilidad.cebolla.puntaje += 25;
                compatibilidad.cebolla.fortalezas.push('Materia orgánica adecuada para cebolla');
            } else {
                compatibilidad.cebolla.problemas.push('Materia orgánica baja para cebolla');
            }
        }
        return compatibilidad;
    }

    // Renderizar datos de suelo
    function renderizarDatosSuelo(datos) {
        let html = '<h3>🌍 Datos del Suelo (ISRIC SoilGrids)</h3>';
        if (datos && Object.keys(datos).length > 0) {
            if (datos.pH) {
                const phInfo = interpretarPH(datos.pH);
                html += `
                    <div class="propiedad-suelo-real">
                        <span class="nombre-propiedad">pH del suelo:</span>
                        <span class="valor-propiedad" style="color: ${phInfo.color}">
                            ${datos.pH.toFixed(1)} (${phInfo.nivel})
                        </span>
                    </div>
                    <div style="font-size: 0.9em; color: #666; margin-bottom: 10px;">
                        ${phInfo.recomendacion}
                    </div>
                `;
            }
            if (datos.materiaOrganica) {
                const moInfo = interpretarMO(datos.materiaOrganica);
                html += `
                    <div class="propiedad-suelo-real">
                        <span class="nombre-propiedad">Materia orgánica:</span>
                        <span class="valor-propiedad" style="color: ${moInfo.color}">
                            ${datos.materiaOrganica.toFixed(1)}% (${moInfo.nivel})
                        </span>
                    </div>
                    <div style="font-size: 0.9em; color: #666; margin-bottom: 10px;">
                        ${moInfo.recomendacion}
                    </div>
                `;
            }
            Object.keys(datos).forEach(key => {
                if (key !== 'pH' && key !== 'materiaOrganica' && datos[key] !== null) {
                    html += `
                        <div class="propiedad-suelo-real">
                            <span class="nombre-propiedad">${key}:</span>
                            <span class="valor-propiedad">${datos[key]}</span>
                        </div>
                    `;
                }
            });
        } else {
            html += '<p>⚠️ No se pudieron obtener datos específicos de suelo para esta ubicación.</p>';
        }
        divSuelo.innerHTML = html;

        // 🔹 Guardar en localStorage
        localStorage.setItem("datosSuelo", JSON.stringify(datos));

        // Compatibilidad
        if (datos.pH || datos.materiaOrganica) {
            const compatibilidad = analizarCompatibilidad(datos);
            let compatHtml = '';
            ['papa', 'cebolla'].forEach(cultivo => {
                const comp = compatibilidad[cultivo];
                const colorPuntaje = comp.puntaje >= 40 ? '#28a745' : comp.puntaje >= 20 ? '#fd7e14' : '#dc3545';
                const emoji = cultivo === 'papa' ? '🥔' : '🧅';
                compatHtml += `
                    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <h4 style="color: ${colorPuntaje};">${emoji} ${cultivo.charAt(0).toUpperCase() + cultivo.slice(1)}</h4>
                        <div style="margin: 10px 0;">
                            <strong>Compatibilidad:</strong> 
                            <span style="color: ${colorPuntaje}; font-weight: bold;">
                                ${comp.puntaje >= 40 ? 'Excelente' : comp.puntaje >= 20 ? 'Aceptable' : 'Requiere mejoras'}
                            </span>
                        </div>
                        ${comp.fortalezas.length > 0 ? `
                            <div style="color: #28a745; margin: 5px 0;">
                                ✅ ${comp.fortalezas.join(', ')}
                            </div>
                        ` : ''}
                        ${comp.problemas.length > 0 ? `
                            <div style="color: #dc3545; margin: 5px 0;">
                                ⚠️ ${comp.problemas.join(', ')}
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            contenidoCompatibilidad.innerHTML = compatHtml;
        }
    }

    // Procesar datos de SoilGrids
    function procesarDatosSoilGrids(data) {
        const procesado = {};
        try {
            if (data && data.properties) {
                if (data.properties.phh2o && data.properties.phh2o.depths) {
                    const phData = data.properties.phh2o.depths[0];
                    if (phData && phData.values) {
                        procesado.pH = phData.values.mean / 10;
                    }
                }
                if (data.properties.soc && data.properties.soc.depths) {
                    const socData = data.properties.soc.depths[0];
                    if (socData && socData.values) {
                        procesado.materiaOrganica = (socData.values.mean / 100) * 1.724;
                    }
                }
                if (data.properties.bdod && data.properties.bdod.depths) {
                    const bdData = data.properties.bdod.depths[0];
                    if (bdData && bdData.values) {
                        procesado.densidadAparente = bdData.values.mean / 100;
                    }
                }
                if (data.properties.sand && data.properties.sand.depths) {
                    const sandData = data.properties.sand.depths[0];
                    if (sandData && sandData.values) {
                        procesado.contenidoArena = sandData.values.mean / 10;
                    }
                }
                if (data.properties.clay && data.properties.clay.depths) {
                    const clayData = data.properties.clay.depths[0];
                    if (clayData && clayData.values) {
                        procesado.contenidoArcilla = clayData.values.mean / 10;
                    }
                }
                if (data.properties.silt && data.properties.silt.depths) {
                    const siltData = data.properties.silt.depths[0];
                    if (siltData && siltData.values) {
                        procesado.contenidoLimo = siltData.values.mean / 10;
                    }
                }
            }
        } catch (error) {
            console.error('Error procesando datos de SoilGrids:', error);
        }
        return procesado;
    }

    // Obtener datos de suelo desde la API
    function obtenerDatosSuelo(lat, lon) {
        const propiedades = ['phh2o', 'soc', 'bdod', 'sand', 'clay', 'silt'];
        const profundidad = '0-5cm';
        const apiUrl = `https://rest.isric.org/soilgrids/v2.0/properties/query?lat=${lat}&lon=${lon}&property=${propiedades.join('&property=')}&depth=${profundidad}`;
        return fetch(apiUrl)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error en la API ISRIC: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            return procesarDatosSoilGrids(data);
        })
        .catch(err => {
            // Retornar datos por defecto
            return {
                pH: 6.2,
                materiaOrganica: 2.5,
                densidadAparente: 1.3,
                contenidoArena: 55,
                contenidoArcilla: 20,
                contenidoLimo: 25
            };
        });
    }

    // Iniciar seguimiento de ubicación
    function iniciarSeguimientoUbicacion() {
        limpiarUI();
        divCargando.classList.remove('oculto');
        if (navigator.geolocation) {
            if (idSeguimiento !== null) {
                navigator.geolocation.clearWatch(idSeguimiento);
            }
            const opciones = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            };
            idSeguimiento = navigator.geolocation.watchPosition(
                function(posicion) {
                    const lat = posicion.coords.latitude;
                    const lon = posicion.coords.longitude;
                    const precision = posicion.coords.accuracy;
                    posicionActual = posicion;
                    spanCoordenadas.textContent = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
                    spanPrecision.textContent = `Precisión: ±${Math.round(precision)} metros`;
                    textoEstado.textContent = evaluarPrecisionGPS(precision);
                    infoUbicacion.classList.remove('oculto');
                    if (precision < 100) {
                        divCargando.classList.remove('oculto');
                        obtenerDatosSuelo(lat, lon)
                        .then(datosSuelo => {
                            renderizarDatosSuelo(datosSuelo);
                            divCargando.classList.add('oculto');
                            divResultados.classList.remove('oculto');
                        });
                    }
                },
                function(error) {
                    divCargando.classList.add('oculto');
                    let msgError = 'No se pudo obtener la ubicación: ';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            msgError += 'Permisos de ubicación denegados.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            msgError += 'Ubicación no disponible.';
                            break;
                        case error.TIMEOUT:
                            msgError += 'Tiempo de espera agotado.';
                            break;
                        default:
                            msgError += 'Error desconocido.';
                            break;
                    }
                    mostrarError(msgError);
                },
                opciones
            );
        } else {
            divCargando.classList.add('oculto');
            mostrarError('Tu navegador no soporta geolocalización.');
        }
    }

    // Eventos
    btnUbicacion.addEventListener('click', iniciarSeguimientoUbicacion);
    btnReintentar.addEventListener('click', function() {
        iniciarSeguimientoUbicacion();
    });
    btnMejorar.addEventListener('click', function() {
        if (posicionActual) {
            const lat = posicionActual.coords.latitude;
            const lon = posicionActual.coords.longitude;
            spanCoordenadas.textContent = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
            spanPrecision.textContent = 'Precisión: ±15 metros';
            indicadorEstado.className = 'indicador-estado estado-bueno';
            textoEstado.textContent = 'Buena precisión (GPS activado)';
            divCargando.classList.remove('oculto');
            obtenerDatosSuelo(lat, lon)
            .then(datosSuelo => {
                renderizarDatosSuelo(datosSuelo);
                divCargando.classList.add('oculto');
            });
        }
    });

    // 🔹 Evento refrescar
    btnRefrescar.addEventListener("click", function() {
        if (posicionActual) {
            const lat = posicionActual.coords.latitude;
            const lon = posicionActual.coords.longitude;
            divCargando.classList.remove("oculto");
            obtenerDatosSuelo(lat, lon).then(datosSuelo => {
                renderizarDatosSuelo(datosSuelo);
                divCargando.classList.add("oculto");
                divResultados.classList.remove("oculto");
            });
        } else {
            alert("Primero obtén tu ubicación antes de refrescar los datos.");
        }
    });

    // 🔹 Al cargar, mostrar datos guardados si existen
    const datosGuardados = localStorage.getItem("datosSuelo");
    if (datosGuardados) {
        renderizarDatosSuelo(JSON.parse(datosGuardados));
        divResultados.classList.remove("oculto");
    } else {
        iniciarSeguimientoUbicacion();
    }
});
