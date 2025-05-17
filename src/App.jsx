import React, { useState } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { jsPDF } from "jspdf";
import './App.css';

function App() {
    const [nameDev, setNameDev] = useState('');
    const [experience, setExperience] = useState('');
    const [technologies, setTechnologies] = useState('');
    const [areaOfInterest, setAreaOfInterest] = useState('');
    const [aspirations, setAspirations] = useState('');
    const [planContent, setPlanContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const planContentTreated = planContent.replace('```html', '').replace('```', '')

    const hasAllInformation = !isLoading && !!nameDev && !!experience && !!technologies && !!areaOfInterest && !!aspirations

    const genAI = new GoogleGenerativeAI(''); // Put here your API key from Google

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const generationConfig = {
        temperature: 0.7,
        topP: 0.95,
    };

    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const generatePlan = async () => {
        setIsLoading(true);
        setError('');
        setPlanContent('');

        const fullProfile = `
        Anos de experiência: ${experience}
        technologies que domina: ${technologies}
        Área de interesse: ${areaOfInterest}
        Aspirações de carreira: ${aspirations}
        `;

        const prompt_base = `Você é um mentor de carreira sênior para desenvolvedores bem humorado e um pouco sarcástico. Seu objetivo é guiar desenvolvedores juniores para alcançarem um nível sênior em sua área.
        O perfil do desenvolvedor júnior é: ${fullProfile} e seu nome é ${nameDev}

        Com base neste perfil, gere um plano de desenvolvimento COMPLETO e DETALHADO, formatado usando **tags HTML semânticas e de formatação** para melhor apresentação. Siga rigorosamente a estrutura abaixo:

        <h2>Saudação e Motivação Inicial</h2>
        <p>[Uma mensagem de boas-vindas e encorajamento, personalizada para o perfil.]</p>
        <hr/>

        <h2>Análise do Perfil e Lacunas Identificadas</h2>
        <p>[Apresente uma breve análise do perfil do desenvolvedor.]</p>
        <h3>Principais Lacunas:</h3>
        <ul>
            <li>... [Lacuna 1]</li>
            <li>... [Lacuna 2]</li>
            </ul>
        <hr/>

        <h2>Plano de Desenvolvimento Personalizado: Rumo ao Sênior</h2>
        <p>[Uma breve introdução ao plano.]</p>

        <h3>Seção 1: [Exemplo: Fundamentos Essenciais para Sênior]</h3>
        <ul>
            <li><strong>Tópico 1.1:</strong> ...</li>
            <li><strong>Tópico 1.2:</strong> ...</li>
            <li><strong>Projeto Sugerido 1:</strong> ...</li>
        </ul>

        <h3>Seção 2: [Exemplo: Aprofundamento em Tecnologia-Chave]</h3>
        <ul>
            <li><strong>Tópico 2.1:</strong> ...</li>
            <li><strong>Tópico 2.2:</strong> ...</li>
            <li><strong>Projeto Sugerido 2:</strong> ...</li>
        </ul>
        <hr/>

        <h2>Recursos de Aprendizado Sugeridos</h2>
        <p>[Introdução aos recursos.]</p>
        <ul>
            <li><strong>Para [Lacuna/Tópico 1]:</strong>
                <ul>
                    <li><a href="...">... [Recurso 1]</a></li>
                    <li>... [Recurso 2]</li>
                </ul>
            </li>
            </ul>
        <hr/>

        <h2>O Papel de um Desenvolvedor Sênior em Sua Área</h2>
        <p>[Explique as responsabilidades de um sênior.]</p>
        <hr/>

        <h2>Desafios Práticos e Próximos Passos</h2>
        <p>[Sugestões de desafios e encorajamento final.]</p>
        <hr/>

        **Importante:** Use tags HTML como <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <hr/>, e <a> para formatar o conteúdo. O conteúdo dentro das tags deve ser o texto relevante.
        `;

        try {
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt_base }] }],
                generationConfig,
                safetySettings,
            });

            const response = result.response;
            setPlanContent(response.text());
        } catch (err) {
            setError(`Erro ao chamar a API do Gemini: ${err.message}. Verifique sua chave de API e as configurações de segurança.`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPdf = () => {
      if (!planContent) {
          setError("Nenhum plano gerado para baixar.");
          return;
      }

      const doc = new jsPDF();
      let y = 15; // Initial Y position
      const marginX = 15; // Left and right margin
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const availableWidth = pageWidth - 2 * marginX; // Available width to add text
      const bottomMargin = 25; // Margin bottom to next page
      const pageBreakPadding = 5; // Extra "buffer" before page break

      const lineSpacingFactor = 1.1; // Line-height
      const listItemLineSpacingFactor = 0.9; // Line-height to lists

      // Function to help calculate the correct text height
      const addTextAndGetHeight = (text, fontSize = 12, fontStyle = 'normal', width = availableWidth) => {
          doc.setFont(doc.getFont().fontName, fontStyle);
          doc.setFontSize(fontSize);
          const splitText = doc.splitTextToSize(text, width);
          return splitText.length * fontSize * lineSpacingFactor;
      };
      
      // Auxiliary function to draw text
      const drawText = (text, yPos, fontSize = 12, fontStyle = 'normal', indent = 0, width = availableWidth) => {
          doc.setFont(doc.getFont().fontName, fontStyle);
          doc.setFontSize(fontSize);
          const splitText = doc.splitTextToSize(text, width - indent); // Adjust indentation
          doc.text(splitText, marginX + indent, yPos);
          return yPos + (splitText.length * fontSize * lineSpacingFactor);
      }

      // --- PDF Title ---
      let titleHeight = addTextAndGetHeight("Plano de Carreira para Desenvolvedores", 22, 'bold');
      let profileInfoHeight = addTextAndGetHeight(`Perfil: ${nameDev} é dev com interesse em ${areaOfInterest} e tem ${experience} anos de experiência.`, 10);
      
      if (y + titleHeight + profileInfoHeight + 10 + pageBreakPadding > pageHeight - bottomMargin) {
          doc.addPage();
          y = 15;
      }
      y = drawText("Plano de Carreira para Desenvolvedores", y, 22, 'bold');
      y = drawText(`Perfil: ${nameDev} é dev com interesse em ${areaOfInterest} e tem ${experience} anos de experiência.`, y, 10);
      y += 10; // White-space after doc header

      // --- Process the planContent HTML ---
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = planContent;

      // Convert the collection of children to an array to iterate over
      const childrenNodes = Array.from(tempDiv.children);

      for (let i = 0; i < childrenNodes.length; i++) {
          const node = childrenNodes[i];
          const textContent = node.textContent.trim();
          let estimatedNodeHeight = 0; // Estimated height for the current node, including spacing
          let initialYForNode = y; // Keep the 'y' before adding pre-element spacing

          // Calculate the estimated node height and spacing before
          if (node.tagName === 'H1') {
              estimatedNodeHeight = addTextAndGetHeight(textContent, 20, 'bold');
              estimatedNodeHeight += 10; // White-space after H1
              initialYForNode += 5; // White-space before H1
          } else if (node.tagName === 'H2') {
              estimatedNodeHeight = addTextAndGetHeight(textContent, 16, 'bold');
              estimatedNodeHeight += 8; // White-space after H2
              initialYForNode += 6; // White-space before H2
          } else if (node.tagName === 'H3') {
              estimatedNodeHeight = addTextAndGetHeight(textContent, 14, 'bold');
              estimatedNodeHeight += 6; // White-space after H3
              initialYForNode += 4; // White-space before H3
          } else if (node.tagName === 'P') {
              estimatedNodeHeight = addTextAndGetHeight(textContent, 12);
              estimatedNodeHeight += 4; // White-space after P
          } else if (node.tagName === 'UL') {
              estimatedNodeHeight += 3; // White-space before list
              Array.from(node.children).forEach(li => {
                  if (li.tagName === 'LI') {
                      let liText = li.textContent.trim().replace(/<\/?strong>/g, '');
                      doc.setFontSize(12);
                      const splitLiTextCalc = doc.splitTextToSize(`• ${liText}`, availableWidth - 10);
                      estimatedNodeHeight += splitLiTextCalc.length * 12 * listItemLineSpacingFactor;
                      estimatedNodeHeight += 1;

                      if (li.querySelector('ul')) {
                          Array.from(li.querySelector('ul').children).forEach(nestedLi => {
                              if (nestedLi.tagName === 'LI') {
                                  let nestedLiText = nestedLi.textContent.trim().replace(/<\/?strong>/g, '');
                                  doc.setFontSize(12);
                                  const splitNestedTextCalc = doc.splitTextToSize(`  - ${nestedLiText}`, availableWidth - 15);
                                  estimatedNodeHeight += splitNestedTextCalc.length * 12 * listItemLineSpacingFactor;
                                  estimatedNodeHeight += 1;
                              }
                          });
                      }
                  }
              });
              estimatedNodeHeight += 3; // White-space after list
          } else if (node.tagName === 'HR') {
              estimatedNodeHeight = 15;
              initialYForNode += 7;
          }

          // --- VERIFICAÇÃO DE PÁGINA ANTES DE DESENHAR ---
          // Adiciona um padding extra para ser mais seguro na quebra de página
          if (initialYForNode + estimatedNodeHeight + pageBreakPadding > pageHeight - bottomMargin) {
              doc.addPage();
              y = 15; // Reset Y
              initialYForNode = 15; // Reset Y temporarily to a new page top
          }

          // --- Draw the content ---
          if (node.tagName === 'H1') {
              y += 5; // White-space before do H1
              y = drawText(textContent, y, 20, 'bold');
              y += 5; // White-space after o H1
          } else if (node.tagName === 'H2') {
              y += 6; // White-space before do H2
              y = drawText(textContent, y, 16, 'bold');
              y += 4; // White-space after o H2
          } else if (node.tagName === 'H3') {
              y += 4; // White-space before do H3
              y = drawText(textContent, y, 14, 'bold');
              y += 2; // White-space after o H3
          } else if (node.tagName === 'P') {
              y = drawText(textContent, y, 12);
              y += 4; // White-space after o parágrafo
          } else if (node.tagName === 'UL') {
              y += 3; // White-space before da lista
              Array.from(node.children).forEach(li => {
                  if (li.tagName === 'LI') {
                      let liText = li.textContent.trim().replace(/<\/?strong>/g, '');
                      doc.setFont(doc.getFont().fontName, 'normal');
                      doc.setFontSize(12);
                      
                      const listItemPrefix = '• ';
                      const splitLiText = doc.splitTextToSize(listItemPrefix + liText, availableWidth - 10);
                      doc.text(splitLiText, marginX + 5, y); // Indent to a bullet point
                      y += (splitLiText.length * 12 * listItemLineSpacingFactor);
                      y += 1;
                  }
              });
              y += 3; // White-space after a lista
          } else if (node.tagName === 'HR') {
              y += 7; // White-space before da linha
              doc.setDrawColor(0);
              doc.line(marginX, y, pageWidth - marginX, y);
              y += 7; // White-space after a linha
          }
      }

      const filename = `Plano_Carreira_${areaOfInterest.replace(' ', '_')}.pdf`;
      doc.save(filename);
  };

    const resetPlan = () => {
      setNameDev('')
      setExperience('')
      setTechnologies('')
      setAreaOfInterest('')
      setAspirations('')
      setPlanContent('')
    }

    return (
        <div className="App">
            <h1 className='mentor-ai'>Mentor IA para Desenvolvedores Juniores</h1>

            {error && <p className="error-message">Erro: {error}</p>}
            {isLoading && <p className='loader'>Carregando...</p>}

            {!planContent && (
              <section className="mentor-form-section">
                <h2>Gerar Plano de Carreira</h2>
                <div className="form-group">
                   <label htmlFor="experience">Informe seu nome:</label>
                   <input
                       type="text"
                       id="nameDev"
                       value={nameDev}
                       onChange={(e) => setNameDev(e.target.value)}
                       required
                   />
                </div>
                <div className="form-group">
                   <label htmlFor="experience">Anos de experiência:</label>
                   <input
                       type="number"
                       id="experience"
                       value={experience}
                       onChange={(e) => setExperience(e.target.value)}
                       required
                   />
                </div>
                <div className="form-group">
                   <label htmlFor="technologies">Tecnologias que domina (ex: Python, JS, React):</label>
                   <input
                       type="text"
                       id="technologies"
                       value={technologies}
                       onChange={(e) => setTechnologies(e.target.value)}
                       required
                   />
                </div>
                <div className="form-group">
                   <label htmlFor="area_interesse">Área de interesse (Frontend, Backend, Fullstack):</label>
                   <input
                       type="text"
                       id="area_interesse"
                       value={areaOfInterest}
                       onChange={(e) => setAreaOfInterest(e.target.value)}
                       required
                   />
                </div>
                <div className="form-group">
                   <label htmlFor="aspirations">Suas aspirações de carreira e tecnologias desejadas:</label>
                   <textarea
                       id="aspirations"
                       value={aspirations}
                       onChange={(e) => setAspirations(e.target.value)}
                       rows="4"
                       required
                   ></textarea>
                </div>
                <button onClick={generatePlan} disabled={!hasAllInformation}>
                   Gerar Plano
                </button>
              </section>
            )}

            {planContent && (
                <div className="plan-output">
                    <h1>Seu Plano de Carreira:</h1>
                    <div className='plan-content' dangerouslySetInnerHTML={{ __html: planContentTreated }} />
                    <div className='buttons'>
                      <button onClick={handleDownloadPdf} disabled={isLoading}>
                        Baixar Plano como PDF
                      </button>
                      <button className='new-plan' onClick={resetPlan}>Gerar Novo Plano</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;