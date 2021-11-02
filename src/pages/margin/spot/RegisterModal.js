import { useState, useEffect } from 'react';
import { Button, Modal, WingBlank, WhiteSpace, Checkbox, Toast } from 'antd-mobile';
import { formatMessage, getLocale } from 'umi-plugin-locale';
import { newmarginRegister } from '@/services/api';
import { connect } from 'dva';

import styles from './RegisterModal.less';
const lang = getLocale();

const RegisterModal = ({ isRegist, user, isOpenMarginV2, dispatch, currency, market, submitCallback }) => {
  const [loading, setloading] = useState(false);
  const [disable, setdisable] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (user.id) {
      dispatch({ type: 'auth/checkMarginAccountState' });
      setVisible(!isOpenMarginV2);
    }
  }, [user, isOpenMarginV2]);

  useEffect(() => {
    if (user.id && !isOpenMarginV2) {
      setVisible(true);
    }
  }, [isRegist]);

  const handleSubmit = async () => {
    setloading(true);
    const res = await newmarginRegister();

    if (res && res.code === 200) {
      setloading(false);
      close();
      dispatch({ type: 'auth/checkMarginAccountState' });
      Toast.success(formatMessage({ id: 'margin.title.account_success' }), () => {
        dispatch({
          type: 'margin/getMarginBalance',
          payload: {
            currency: `${currency}_${market}`,
            accountType: 'STEP'
          }
        });
        typeof submitCallback === 'function' && submitCallback();
      });
    }
    setloading(false);
  };

  const close = () => {
    setVisible(false);
  };

  return (
    <Modal popup animationType="slide-up" visible={visible} onClose={close}>
      <div className={styles.modalBox}>
        <WingBlank>
          {lang.startsWith('zh') && (
            <div className={styles.textarea}>
              <h3>杠杆交易开通协议</h3>
              <p>
                本《杠杆交易服务协议》（“本协议”）是本网站（也称“平台”）与用户（“您”）之间就您使用本网站提供的数字资产杠杆借贷及杠杆交易服务（“本服务”）而订立的协议。您访问、登录本网站（包括本网站的API、移动应用程序等客户端）、使用本网站（包括本网站的移动应用程序）提供的任何服务、或点击“已阅读并同意”按钮的行为，即表示您确认已经阅读、理解并接受本服务协议规定的所有条款和条件，以及《用户协议》规定的所有条款和条件。如果您不同意本协议或《用户协议》的任何条款或条件，请停止访问本网站并停止使用本服务。如果您继续访问本网站或使用本服务，则视为您无条件同意本协议及《用户协议》的全部内容。本协议语言为中文，为方便用户理解，本协议可能会被翻译为不同语言，除中文版本外，其他语言版本仅供参考。如果不同语言版本之间有不一致的，以中文版本为准。
              </p>
              <p>
                1.
                协议范围及适用。您使用本网站进行杠杆交易的行为适用本协议。本协议包括本网站针对不同杠杆交易服务而制定的业务规则、以及本网站以公告形式对本协议及业务规则不时进行的修改等附加条款，包括但不限于《全仓杠杆业务规则》以及任何有关杠杆倍数、费率、保证金、风险率、强行平仓等的公告。本协议是《用户协议》的补充协议，本协议与《用户协议》规定不一致的，以本协议为准。本协议未明确规定的，以《用户协议》为准。
              </p>
              <p>
                2.
                协议修改。本网站保留随时自行决定、修改或变更本协议的权利。对本协议的任何及所有修改或变更将在本网站上公布或发送给用户后立即生效。因此，您继续使用本网站服务的行为，即表示接受修改后的协议和规则。如果您不同意对本协议进行的任何修改，请立即停止使用本服务。本网站建议您经常查看本协议，以确保您理解适用于您访问和使用本服务的条款和条件。
              </p>
              <p>
                3.
                自愿行为。您在本网站进行杠杆交易完全是您本人根据自身经济情况并在了解面临的相关风险后进行的自愿交易行为，与本网站以及第三人无任何关系。
              </p>
              <p>
                4.
                风险提示。您在本网站进行杠杆交易时，您可能会获得较高的投资收益，但同时也存在较大的投资风险。为了使您更好的了解其中的风险，根据有关法律法规、行政规章及相关国家政策，特向您对杠杆交易存在的风险进行提示，请您认真详细阅读。您在本网站进行杠杆交易存在的风险包括但不限于：
              </p>
              <p>
                (1)
                数字资产本身的风险：数字资产市场是全新的、未经确认的，而且可能不会增长。目前，数字资产主要由投机者大量使用，零售和商业市场使用相对较少。因此，数字资产价格易产生波动，并进而对数字资产投资产生不利影响。数字资产市场没有像股市那样的涨跌停限制，同时交易是24小时开放的。数字资产由于筹码较少，价格易受到庄家控制以及各国监管政策的影响而大幅波动，即有可能出现一天价格涨几倍的情况，同时也可能出现一天内价格跌去一半的情况。因此，您必须了解并同意，因为数字资产本身的原因给您造成的经济损失全部由您自行承担。
              </p>
              <p>
                (2)
                政策风险：因各国针对数字资产的法律、法规和规范性文件的制定或者修改，数字资产交易随时可能被暂停、或被禁止。您必须了解并同意，因国家法律、法规和规范性文件的制定或者修改，导致数字资产的交易被暂停、或者禁止的，因此造成的经济损失全部由您自行承担。
              </p>
              <p>
                (3)
                互联网及技术风险：本网站不能保证本网站包含的全部信息、程序、文本等完全安全，不受任何病毒、木马等恶意程序的干扰和破坏，故您登陆、使用本网站任何服务或下载及使用该下载的任何程序、信息、数据等均是您个人的决定并自行承担风险及可能产生的损失。同时使用互联网形式的交易系统亦存有风险，包括但不限于软件、硬件和互联网链接的失败等。由于本网站不能控制互联网的可靠性和可用性，本网站不会对失真、延误和链接失败而承担任何责任。同时，因服务器网关瓶颈、网站访问不稳定等各种因素造成杠杆账户被平仓的风险及损失，用户应当自行承担。
              </p>
              <p>
                (4)
                不可抗力风险：本网站对由于信息网络设备维护、信息网络连接故障、电脑、通讯或其他系统的故障、电力故障、遭遇黑客攻击、天气原因、意外事故、罢工、劳动争议、暴乱、起义、骚乱、生产力或生产资料不足、火灾、洪水、风暴、爆炸、战争、银行或其他合作方原因、数字资产市场崩溃、政府行为、司法或行政机关的命令、其他不在本网站可控范围内或本网站无能力控制的行为或第三方的原因而造成的不能服务或延迟服务，以及造成的您的损失，本网站不承担任何责任。
              </p>
              <p>
                (5)
                行情风险。本网站不保证有关行情分析、市场评析等内容的正确性和适用性，对于您已经或将会从介绍人或其他任何机构及雇员处获得的资讯或建议，本网站不能控制，也不支持或担保其关于交易的准确性或完备性，由此导致的一切风险或后果由您本人自行承担，与本网站无任何牵涉。
              </p>
              <p>
                (6)
                被查封、冻结风险。当有权机关出示相应的调查文件要求本网站配合对您在本网站的账户、资产或交易数据进行调查时，或对您的账户采取查封、冻结或者划转措施时，本网站将按照有权机关的要求协助提供您的相应数据，或进行相应的操作，因此而造成的隐私泄露、账户不能操作及损失等，由用户自行承担全部责任。
              </p>
              <p>
                (7)
                其他风险：下列情形发生的损失都将由您自行承担：（a）由于您丢失账户、忘记密码、操作不当、投资决策失误等原因导致您发生亏损；（b）网上委托、热键操作完毕后未及时退出，他人进行恶意操作而造成的损失；（c）委托他人代理您进行本网站的杠杆交易造成的损失；（d）其他意外事件以及非因本网站原因造成的损失。
              </p>
              <p>
                特别提示：您参与本网站杠杆借贷及杠杆交易，应当自行控制风险，评估数字资产投资价值和投资风险，并承担损失全部投资的经济风险；您应当根据自身的经济条件和风险承受能力进行交易，并清醒地认识到数字资产投资存在的风险。您在进行数字资产杠杆投资时既存在盈利的可能，也存在亏损的风险。本协议风险提示并不能揭示数字资产杠杆交易的全部风险。请您务必对此有清醒的认识，市场有风险，投资需谨慎。
              </p>
              <p>5. 定义。在本协议中，下列术语应具有下列定义：</p>
              <p>(1) 杠杆交易：是指在本网站使用杠杆借贷数字资产而进行的交易。</p>
              <p>
                (2)
                杠杆账户：是指在用户现有的UID账户下设置的专门用于存放保证金和杠杆借贷数字资产的虚拟子账户，其资产核算独立于用户UID账户下的其他子账户。
              </p>
              <p>(3) 杠杆借贷：是指为了进行杠杆交易之目的而通过本网站申请的数字资产借贷。</p>
              <p>(4) 保证金：是指作为杠杆借贷的担保物而必须由您提前划转到指定杠杆账户内的一定数额的数字资产。</p>
              <p>(5) 风险率：是指杠杆账户的风险率，即根据每个杠杆账户内杠杆借贷数额以及账户内资产总值而计算的风险率。</p>
              <p>
                (6)
                强行平仓：是指您的杠杆账户的风险率达到一定标准时，本网站有权对您的杠杆账户内的全部资产自行处分以收回借贷及相应利息费用的行为，也称“强平”。
              </p>
              <p>
                6.
                本服务类型。本网站提供的杠杆交易服务分为逐仓杠杆交易与全仓杠杆交易两种类型。不同的杠杆交易适用不同的业务规则，用户在使用任一种杠杆交易服务时应当仔细阅读并同意遵守相应的业务规则。
              </p>
              <p>7. 资格。在使用本服务时，用户必须已经按照《用户协议》的规定完成账户注册与认证，并合法持有有效UID账户及登录密码。</p>
              <p>
                8.
                设置杠杆账户。用户首次申请某种数字资产杠杆借贷时，本网站会自动为该用户设置杠杆账户，仅用于存放与核算杠杆借贷相关的数字资产与保证金，可适用的数字资产种类根据用户选择的杠杆交易类型及相应的业务规则确定。该杠杆账户的账号或登录密码同用户的UID账号及登录密码，用户在登录其UID账户后即可对该杠杆账户进行操作。
              </p>
              <p>
                9.
                划转保证金。用户在申请杠杆借贷之前，必须按照要求向指定杠杆账户中转入符合条件的保证金。可允许的保证金种类及可借贷的数字资产种类根据用户选择的杠杆交易类型及相应的业务规则确定。
              </p>
              <p>10. 申请借贷。在保证金到账后，用户可在本网站允许的最大借贷额度内申请杠杆借贷。</p>
              <p>
                11.
                费用。用户知悉并同意在使用本服务时可能产生借贷利息以及手续费等相关费用，并同意按照本协议的要求支付相应的费用。杠杆借贷利息从您收到杠杆借贷数字资产之时起，按照小时计算，不足一小时的按照一小时计算。杠杆借贷的利息费用标准及支付方式以相应的业务规则为准。手续费标准及支付方式以《用户协议》及相关的平台交易手续费业务规则或公告为准。
              </p>
              <p>
                12.
                借贷归还。用户应当按照本协议的约定及时归还借贷的数字资产。您每次申请和归还借贷都按笔处理，每笔借贷归还时均优先向本网站支付借贷利息。
              </p>
              <p>13. 为了保护资金安全，用户知悉并同意，当您有借贷未归还时，本网站有权对您的杠杆账户采取限制划转的措施。</p>
              <p>
                14.
                强制平仓。当您在本网站杠杆账户中的总资产不足实际借贷额度的110%时，本网站将有权按照本网站实时委托单价格对您的杠杆账户中的全部资产进行强制买入或卖出以归还借贷额度。如果价格波动剧烈，系统无法强制平仓或者强制平仓后仍不能归还借贷额度及相关利息的，或者导致本网站其他损失的，本网站有权向您继续追偿，或者在您任何时候向该杠杆账户中转入数字资产时，本网站有权以该数字资产偿还之前的借贷数额及相关利息或赔偿其他损失。
              </p>
              <p>15. 用户在使用本服务时应当遵守适用的法律法规，遵守杠杆借贷相关的业务规则，遵守本协议及《用户协议》的规定。</p>
              <p>16. 本网站保留为了风控目的在必要情况下单方、随时暂停或终止杠杆借交易及相关服务的权利。</p>
              <p>
                17.本协议的订立、效力、解释、履行和争议的解决均应适用新加坡共和国法律并依其解释，因本协的签订、履行发生的任何纠纷双方均应当友好协商，若协商不成任意一方有权向新加坡国际仲裁中心提起仲裁，并按照提交仲裁申请时有效的《新加坡国际仲裁中心仲裁规则》最终解决。因为本协议而产生的纠纷仲裁地为新加坡共和国。
              </p>
            </div>
          )}
          {!lang.startsWith('zh') && (
            <div className={styles.textarea}>
              <h3>Margin Transaction Agreement</h3>
              <p>
                This Marging Trading Service Agreement (“this Agreement”) is an agreement entered into by and between this Website (also
                known as “the Platform”) and the User (“You”) regarding Your use of the digital asset Margin Loan and margin trading
                services provided by this Website (hereinafter referred to as “the Services”). By visiting and logging into this Website
                (including the API, applications and other terminals thereof), using any service provided by this Website, or clicking on
                the “Read and Agree” button, You confirm that You have read, understood and accepted all the terms and conditions set forth
                in this Agreement, as well as all the terms and conditions set forth in the User Agreement. If You do not agree to any term
                or condition of this Agreement or the User Agreement, please stop visiting this Website and stop using the Services. If You
                continue visiting this Website or using the Services, You will be deemed to have unconditionally agreed to the entire
                content of this Agreement and the User Agreement. This Agreement is made in Chinese. For the convenience of the Users, this
                Agreement may be translated into different languages. All language versions of this Agreement, except for the Chinese
                version hereof, are for reference only. Should there be any inconsistency between different language versions hereof, the
                Chinese version hereof shall always prevail.
              </p>
              <p>
                1. Scope and Application of this Agreement. This Agreement shall apply to Your use of this Website for margin trading. This
                Agreement includes the operating rules formulated by this Website for different types of margin trading services, as well as
                the additional clauses such as amendments to this Agreement and the operating rules from time to time by this Website in the
                form of announcements, including but not limited to Cross Margin Trading Rules, Isolated Margin Trading Rules, and any and
                all announcements regarding leverage multiples, rates, margins, risk ratio, forced liquidation, etc. This Agreement is a
                supplementary agreement to the User Agreement. In case of any inconsistency between this Agreement and the User Agreement,
                this Agreement shall prevail. With regard to any matter for which there is no specific provision herein, the User Agreement
                shall prevail in connection with such matter.
              </p>
              <p>
                2. Modification. This Website reserves the right to decide, at its sole discretion, to modify or amend this Agreement from
                time to time and at any time. Any and all modifications or amendment to this Agreement will take effect upon being published
                on this Website or otherwise delivered to the Users. Therefore, by continuing to use the services of this Website, You shall
                be deemed to have accepted the modified or amended agreement and rules hereunder. If You do not agree to any modification or
                amendment made to this Agreement, You shall cease Your use of the Services hereunder immediately. It is Your responsibility
                to review this Agreement frequently to ensure that You understand the terms and conditions applicable to Your access to and
                use of the Services.
              </p>
              <p>
                3. Voluntary Conduct. You acknowledge that Your conduct of margin trading on this Website is entirely a voluntary conduct of
                Yours based on Your own economic situation and Your knowledge of the relevant risks You face, which is not related to this
                Website and the third party in any manner whatsoever.
              </p>
              <p>
                4. Risk Reminder. When You engage in margin trading on this Website, You may get relatively high returns; however, You may
                also be subject to significant risks. In order to help You better understand the potential risks and, in accordance with
                relevant laws, regulations, administrative rules and relevant state policies, we hereby advise You of the risks that may be
                involved in margin trading, which we encourage you to read carefully, which include but are not limited to-:
              </p>
              <p>
                (1) The risks of digital assets themselves: the digital asset market is a brand new and unverified market that may or may
                not grow. At present, digital assets are mostly used by speculators, and less used in retailing and commercial markets;
                therefore, the price of digital assets is volatile and prone to fluctuations, which may further adversely affect the
                investment in digital assets. Unlike the stock market, the digital asset market does not have any limit up and down, and the
                trading on the digital asset market is open 24 hours a day. The price of digital assets may fluctuate greatly because: (i)
                the number of chips is relatively small; (ii) the market prices are vulnerable to control by the market makers; and (iii)
                the influence of regulatory policies of countries concerned, among others. The price may rise several times or fall by half
                in a single day. Therefore, You must understand and agree that You will be solely responsible for any and all the economic
                losses caused to You due to the digital assets themselves.
              </p>
              <p>
                (2) Policy Risks: Digital asset transactions may be suspended or prohibited at any time due to the formulation or
                modification of applicable laws, rules and regulations for digital assets in various jurisdictions. You must understand and
                agree that due to the formulation or modification of applicable laws, regulations and regulatory documents, the transaction
                of digital assets may be suspended or prohibited, and any and all economic losses as a result therefrom shall be borne by
                You.
              </p>
              <p>
                (3) Internet and Technical Risks: this Website cannot and will not warrant the absolute security of information, programs,
                texts and other information contained in this Website, or warrant that they are free from interference and damage by any
                malicious programs, such as computer viruses and Trojans. Therefore, You shall be solely responsible for any risks and
                losses arising out of or in connection with Your logging in and using any service of this Website, using this Website to
                download any program, information and data, or using such downloaded program, information and data. At the same time, the
                use of Internet-based trading systems also involves risks, including but not limited to the failure of software, hardware
                and Internet connection. As this Website cannot control the reliability and availability of the Internet, this Website shall
                not be held liable in any manner whatsoever for any distortion, delay and connection failure. At the same time, the Users
                should bear the risks and losses arising out of the closing out of any margin trading account due to server gateway
                bottleneck, or unstable website access, among others.
              </p>
              <p>
                (4) Force Majeure Risks: this Website shall not be held liable in any manner for any inability to provide the Services or
                any delay in providing such Services, or any and all loss and damages You may sustain therefrom, which are caused by any of
                the following factors: maintenance of information network equipment, failure of information network connection, malfunction
                of computers, communication system or other systems, power failure, exposure to hacker attacks, weather, accidents,
                industrial actions, labor disputes, riots, uprisings, riots, insufficient productivity or means of production, fires,
                floods, storms, explosions, wars, bank or other partners, collapse of the digital asset market, government behaviors,
                judicial or administrative orders or any other conducts that are beyond the control of this Website or any factor on the
                part of any third party.
              </p>
              <p>
                (5) Market Risks. This Website does not warrant the correctness or applicability of any relevant market analyses, market
                evaluation and other content on this Website or elsewhere. This Website cannot control, support or guarantee the accuracy or
                completeness of the information or suggestions that You have obtained or will obtain from your agent or any other
                organization or employee thereof. You must be solely responsible for any and all risks or consequences arising therefrom,
                and this Website shall not be held liable in any manner whatsoever.
              </p>
              <p>
                (6) Risks of Seizure and Freezing. When a competent authority, by presenting the requisite warrant for an investigation,
                requires this Website to assist with the investigation into Your account with this Website, Your assets or Your transaction
                data on the Website, or adopt such measures against Your account as sealing up, freezing or transfers, this Website shall
                provide such assistance by providing Your relevant data or carrying out corresponding operations in accordance with the
                requirements of the competent authority, and in this case, this Website shall not bear the responsibility for privacy
                disclosure, account access interruption, and even losses caused thereby.
              </p>
              <p>
                (7) Other Risks: You shall bear any and all losses arising in any of the following situations: (a) losses you sustain due to
                such factors as lost account ID, forgotten password, improper operation, and investment decision-making mistakes; (b) losses
                caused by any malicious operation of Your account by any third party because you engage in online entrustment or You fail to
                log out after hot-key operation through Your account; (c) losses caused by You entrusting any other person to carry out
                margin trading on this Website on Your behalf; (d) Losses caused by any other accident and factors not attributable to this
                Website.
              </p>
              <p>
                Special Reminder: When You engage in Margin Loan and margin trading on this Website, You should manage the potential risks
                thereof by your own, assess the value and risks of investment in digital assets, and bear the possible financial risks of
                losing all Your investments. You should take consideration of Your own financial conditions and risk tolerance capacity
                before conducting any margin trading, and clearly recognize the risks of digital asset investment. You may make profits or
                sustain losses when engaging in margin trading in digital assets. The Risk Reminder in this Agreement does not list all
                risks involved in margin trading of digital assets. You are hereby advised to have a clear understanding of this, and please
                be reminded that the investment market may involve high risks and prudent investment is recommended.
              </p>
              <p>5. Definitions. In this Agreement, the following terms shall have the following meanings:</p>
              <p>
                (1) Margin Trading: refers to digital asset transactions conducted by using borrowed digital assets of Margin Loan on this
                Website.
              </p>
              <p>
                (2) Margin Trading Account: refers to a virtual sub-account set up under the User's existing UID account for deposit and
                borrowed digital assets of Margin Loan. The accounting of assets under the Margin Trading Account is separate from that of
                other sub-accounts under the User's UID account.
              </p>
              <p>(3) Margin Loan: refers to borrowing of digital assets from this Website for the purpose of conducting Margin Trading.</p>
              <p>
                (4) Margin: refers to a certain amount of digital assets that must be deposited to the designated Margin Trading Account in
                advance as collateral for Margin Loans.
              </p>
              <p>
                (5) Risk Ratio: refers to the risk ratio of a Margin Trading Account, that is, the risk ratio calculated on the basis of the
                amount of Margin Loans in each Margin Trading Account and the total value of assets in the same account.
              </p>
              <p>
                (6) Forced Liquidation: refers to the action or actions that this Website are entitled to take to dispose of all assets in a
                Margin Trading Account to recover the Margin Loan and corresponding interest when and if the risk ratio of such Margin
                Trading Account reaches a certain standard, also known as “FL”.
              </p>
              <p>
                6. Types of Services. The margin trading services provided by this Website are divided into two types: Isolated Margin
                Trading and Cross Margin Trading. Different types of margin trading are subject to different operating rules. Users should
                carefully read and agree to abide by the corresponding operating rules when they use a specific type of margin trading
                service.
              </p>
              <p>
                7. Qualifications. When using the Services hereunder, You must have completed the account registration and authentication in
                accordance with the terms and conditions of the User Agreement, and legally hold a valid UID account and login password.
              </p>
              <p>
                8. Set-up of a Margin Trading Account. When a User applies for a Margin Loan with certain digital asset for the first time,
                this Website will automatically set up a margin trading account for the User, which shall be exclusively used for storing
                and accounting of digital assets related to the such Margin Loan. The applicable type of digital assets is determined in
                accordance with the type of margin trading selected by You and the corresponding operating rules. The account number or
                login password of Your margin trading account is the same as Your UID account number and login password of the User, and You
                can operate Your margin trading account after logging into Your UID account.
              </p>
              <p>
                9. Transfer of Margin. Before applying for any Margin Loan, You must deposit the required margin to the designated margin
                trading account. The type of digital assets permitted for using as margin and for Margin Loan will be determined by this
                Website in accordance with the type of the margin trading selected by You and the corresponding operating rules thereof.
              </p>
              <p>
                10. Application for Margin Loan. After the required margin is received, You may apply for a Margin Loan subject to the
                maximum Margin Loan allowed on this Website.
              </p>
              <p>
                11. Expenses. You acknowledge and agree that the loan interest, handling fee and other related expenses may be incurred when
                using the Services, and You agree to pay such interests, fees or expenses in accordance with this Agreement. Margin Loan
                interest is calculated on an hourly basis starting from the time when You receive the Margin Loan, and for the time that is
                less than one hour, it will be deemed as an hour. The hourly interest rates and payment method for Margin Loans shall be
                subject to the corresponding operating rules. The rate of handling fees and payment method shall be subject to the User
                Agreement and relevant rules and announcements of the Platform for the transaction handling fees.
              </p>
              <p>
                12. Loan Repayment. You shall timely return the borrowed digital assets of any and all Margin Loans in accordance with this
                Agreement. Each application and loan repayment shall be handled on a case-by-case basis, and any repayment to the Website
                will be deemed as payment of the loan interest first, and then the principal of the Margin Loan.
              </p>
              <p>
                13. For the sake of funds security, You acknowledge and agree that this Website has the right to restrict any transfer out
                of Your margin trading account when You have any outstanding loan.
              </p>
              <p>
                14. Forced Liquidation. When the total assets in your margin trading account with this Website are less than 110% of the
                aggregate amount of all outstanding Margin Loans for the same account, this Website will have the right to either buy with
                or sell all the assets in such account to repay the outstanding Margin Loans at the real-time order price of this Website.
                If, because price fluctuates violently, the system may not be able to close the position, or to recover all the outstanding
                Margin Loans and related interests after closing the position, or this Website may sustain other losses, this Website shall
                have the right to recourse for repayment or compensation from You, and at any subsequent time when You transfer digital
                assets to the margin trading account, this Website shall have the right to dispose of such digital assets to recover such
                outstanding Margin Loans and related interests or compensation for other losses.
              </p>
              <p>
                15. When using the Services, You shall abide by all applicable laws and regulations, follow operating rules related to each
                margin trading, and comply with the provisions of this Agreement and the User Agreement.
              </p>
              <p>
                16. This Website reserves the right to unilaterally suspend or terminate the provision of Margin Loan and related services
                at any time if necessary for risk control purposes.17. The conclusion, validity, interpretation, performance and settlement
                of disputes of this Agreement shall be governed by and construed in accordance with the laws of the Republic of Singapore.
                Any dispute arising from the signing or performance of this Agreement shall be negotiated by both parties in amicable
                manner. If the negotiation fails, either party shall have the right to file arbitration application to the Singapore
                International Arbitration Centre, and the dispute shall be referred to and finally resolved by arbitration in Singapore in
                accordance with the Arbitration Rules of the Singapore International Arbitration Centre (“SIAC Rules”) for the time being in
                force.
              </p>
              <p>
                17. The conclusion, validity, interpretation, performance and settlement of disputes of this Agreement shall be governed by
                and construed in accordance with the laws of the Republic of Singapore. Any dispute arising from the signing or performance
                of this Agreement shall be negotiated by both parties in amicable manner. If the negotiation fails, either party shall have
                the right to file arbitration application to the Singapore International Arbitration Centre, and the dispute shall be
                referred to and finally resolved by arbitration in Singapore in accordance with the Arbitration Rules of the Singapore
                International Arbitration Centre (“SIAC Rules”) for the time being in force.
              </p>
            </div>
          )}
          <WhiteSpace></WhiteSpace>
          <div className={styles.registerBtns}>
            <Checkbox onChange={() => setdisable(!disable)}>{formatMessage({ id: 'margin.title.margin_polic_agree' })}</Checkbox>
            <Button inline key="submit" type="primary" disabled={disable} loading={loading} onClick={handleSubmit}>
              {formatMessage({ id: 'margin.title.agree_account' })}
            </Button>
          </div>
        </WingBlank>
      </div>
    </Modal>
  );
};

export default connect(({ auth, trading }) => ({
  market: trading.currentPair.market,
  currency: trading.currentPair.currency,
  isOpenMarginV2: auth.isOpenMarginV2,
  user: auth.user
}))(RegisterModal);
