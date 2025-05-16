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

    const hasAllInformation = !isLoading && !!nameDev && !!experience && !!technologies && !!areaOfInterest && !!aspirations

    const genAI = new GoogleGenerativeAI('AIzaSyBkpOXH9yCLWm3B98rPl3g87fUMsEcmHzY'); // Test key that will be deleted later

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
        const prompt_base = `Você é um mentor de carreira sênior para desenvolvedores. Seu objetivo é guiar desenvolvedores juniores para alcançarem um nível sênior em sua área.
        O perfil do desenvolvedor júnior é: ${fullProfile} e seu nome é ${nameDev}

        Com base neste perfil, gere um plano de desenvolvimento COMPLETO e DETALHADO, seguindo rigorosamente a estrutura abaixo.
        Não repita informações e use linhas em branco para separar claramente cada seção e sub-seção.

        ## Saudação e Motivação Inicial
        [Uma mensagem de boas-vindas e encorajamento, personalizada para o perfil.]

        ---

        ## Análise do Perfil e Lacunas Identificadas
        [Apresente uma breve análise do perfil do desenvolvedor. Em seguida, liste os pontos fortes e, principalmente, as **principais lacunas de conhecimento e habilidades** que o desenvolvedor precisa preencher para se tornar sênior na área (frontend ou backend). Use bullet points para as lacunas.]

        ---

        ## Plano de Desenvolvimento Personalizado: Rumo ao Sênior
        [Crie um plano de estudos e projetos práticos. Organize por tópicos ou fases, sendo muito específico. Inclua technologies-chave, conceitos importantes e sugestões de mini-projetos ou exercícios. Use bullet points para os itens de estudo e projetos.]

        ---

        ### Seção 1: [Exemplo: Fundamentos Essenciais para Sênior]
        * [Tópico 1.1]
        * [Tópico 1.2]
        * [Projeto Sugerido 1]

        ### Seção 2: [Exemplo: Aprofundamento em Tecnologia-Chave]
        * [Tópico 2.1]
        * [Tópico 2.2]
        * [Projeto Sugerido 2]

        ---

        ## Recursos de Aprendizado Sugeridos
        [Para cada lacuna ou tópico importante no plano, sugira 3-5 recursos de aprendizado de alta qualidade (ex: livros, cursos online específicos, documentações oficiais, canais do YouTube renomados, repositórios GitHub de referência, artigos técnicos, comunidades relevantes). Organize por tópico ou tipo de recurso.]

        ---

        ## O Papel de um Desenvolvedor Sênior em Sua Área
        [Explique em detalhes as responsabilidades, expectativas e o escopo de atuação de um desenvolvedor sênior na área específica deste júnior (ex: liderança técnica, design de arquitetura, mentoria de juniores, code review, otimização de performance, decisões de stack). Seja claro e conciso.]

        ---

        ## Desafios Práticos e Próximos Passos
        [Sugira 1-2 pequenos desafios ou problemas de codificação para o desenvolvedor júnior resolver (não a solução, mas a descrição do desafio). Incentive a prática contínua e a busca por feedback. Encerre com uma mensagem final de encorajamento.]

        ---

        **Importante:** Mantenha um tom profissional e motivador. Utilize negrito para destacar termos importantes. Assegure que as seções sejam delimitadas por '---' e que cada tópico dentro delas use bullet points como '-' e esteja em uma nova linha.
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

        doc.setFontSize(22);
        doc.text("Seu Plano de Carreira Rumo ao Nível Sênior", 15, y);
        y += 10;
        doc.setFontSize(10);
        doc.text(`Perfil: ${areaOfInterest} com ${experience} anos de experiência`, 15, y);
        y += 20;

        doc.setFontSize(12);
        const lines = planContent.split('\n');

        lines.forEach(line => {
            const trimmedLine = line.trim();

            if (trimmedLine === '---') {
                doc.setDrawColor(0);
                doc.line(15, y, 195, y);
                y += 10;
                return;
            }

            if (!trimmedLine) {
                y += 5;
                return;
            }

            // Trata cabeçalhos (##)
            if (trimmedLine.startsWith('## ')) {
                doc.setFontSize(16);
                doc.text(trimmedLine.replace('## ', ''), 15, y);
                y += 10; // Espaço após o cabeçalho
            }
            // Trata sub-cabeçalhos (###)
            else if (trimmedLine.startsWith('### ')) {
                doc.setFontSize(14);
                doc.text(trimmedLine.replace('### ', ''), 15, y);
                y += 8; // Espaço após o sub-cabeçalho
            }
            // Trata bullet points (* ou -)
            else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
                doc.setFontSize(12);
                // wrap text for bullet points
                const bulletText = trimmedLine.replace(/^[*-]\s/, ''); // Remove '*' ou '-'
                const splitText = doc.splitTextToSize(`• ${bulletText}`, 180); // Ajusta a largura para o conteúdo
                doc.text(splitText, 20, y); // Recua um pouco para o bullet
                y += (splitText.length * 7); // Incrementa Y baseado no número de linhas do texto quebrado
            }
            // Trata negrito (simples, não renderiza negrito real no PDF com essa abordagem)
            else {
                doc.setFontSize(12);
                const processedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove ** para exibir texto normal
                const splitText = doc.splitTextToSize(processedLine, 180); // Quebra o texto se for muito longo
                doc.text(splitText, 15, y);
                y += (splitText.length * 7); // Incrementa Y baseado no número de linhas do texto quebrado
            }

            // Adiciona nova página se não houver espaço suficiente
            if (y > 280) { // Perto do final da página
                doc.addPage();
                y = 15; // Reseta Y para a nova página
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
            <h1>Mentor IA para Desenvolvedores Juniores</h1>

            {error && <p className="error-message">Erro: {error}</p>}
            {isLoading && <p>Carregando...</p>}

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
                    <h3>Seu Plano de Carreira:</h3>
                    <pre className='plan-content'>{planContent}</pre>
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