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
        topK: 0,
        maxOutputTokens: 2048,
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

        // Prompt otimizado para evitar repetições e garantir formatação clara
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
    let y = 15;
    const marginX = 15;

    // Função auxiliar para adicionar texto com quebra de linha
    const addText = (text, x, yPos, maxWidth, fontSize = 12, fontStyle = 'normal') => {
        doc.setFont(doc.getFont().fontName, fontStyle);
        doc.setFontSize(fontSize);
        const splitText = doc.splitTextToSize(text, maxWidth);
        doc.text(splitText, x, yPos);
        return yPos + (splitText.length * fontSize * 0.9); // Retorna nova posição Y
    };

    // --- Título Principal do PDF ---
    doc.setFontSize(22);
    doc.text("Plano de Carreira para Desenvolvedores", marginX, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Perfil: ${areaOfInterest} com ${experience} anos de experiência para ${nameDev}`, marginX, y);
    y += 20; // Espaço após o cabeçalho do documento

    // --- Processar o HTML do planContent ---
    // Cria um elemento DOM temporário para parsear o HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = planContent;

    // Itera sobre os nós filhos (h1, h2, p, ul, hr)
    Array.from(tempDiv.children).forEach(node => {
        // Garante que não ultrapassa o limite da página
        if (y > 270) { // Margem de 270 para não chegar ao final da página
            doc.addPage();
            y = 15; // Reseta Y
        }

        const textContent = node.textContent.trim(); // Texto puro do nó

        if (node.tagName === 'H1') {
            y += 10; // Espaço antes do H1
            y = addText(textContent, marginX, y, 180, 20, 'bold');
            y += 8; // Espaço após o H1
        } else if (node.tagName === 'H2') {
            y += 8; // Espaço antes do H2
            y = addText(textContent, marginX, y, 180, 16, 'bold');
            y += 6; // Espaço após o H2
        } else if (node.tagName === 'H3') {
            y += 6; // Espaço antes do H3
            y = addText(textContent, marginX, y, 180, 14, 'bold');
            y += 4; // Espaço após o H3
        } else if (node.tagName === 'P') {
            y = addText(textContent, marginX, y, 180);
            y += 6; // Espaço após o parágrafo
        } else if (node.tagName === 'UL') {
            y += 5; // Espaço antes da lista
            Array.from(node.children).forEach(li => {
                if (li.tagName === 'LI') {
                    let liText = li.textContent.trim();
                    // Tenta preservar negrito dentro do LI, mas `jsPDF` não suporta tags HTML para estilo
                    // Apenas remove as tags para não aparecer no texto
                    liText = liText.replace(/<\/?strong>/g, ''); // Remove tags <strong>
                    
                    // Quebra o texto da lista para ajustar na página
                    const splitLiText = doc.splitTextToSize(`• ${liText}`, 170); // Margem maior para bullet
                    doc.setFont(doc.getFont().fontName, 'normal'); // Volta para normal para lista
                    doc.setFontSize(12);
                    doc.text(splitLiText, marginX + 5, y); // Recuo para o bullet point
                    y += (splitLiText.length * 7); // Incrementa Y baseado no número de linhas
                }
            });
            y += 5; // Espaço após a lista
        } else if (node.tagName === 'HR') {
            y += 10; // Espaço antes da linha
            doc.setDrawColor(0); // Cor da linha (preto)
            doc.line(marginX, y, 210 - marginX, y); // Desenha uma linha horizontal
            y += 10; // Espaço após a linha
        }
    });

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
                   <label htmlFor="aspirations">Suas aspirações de carreira e technologies desejadas:</label>
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
                      <button className='new-plan' onClick={resetPlan}>Gerar novo plano</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;