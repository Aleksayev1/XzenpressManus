import React from 'react';
import { X, Download, Copy, CheckCircle, Share2, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PartnershipModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PartnershipModal: React.FC<PartnershipModalProps> = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

    if (!isOpen) return null;

    const banners = [
        {
            id: '300x250',
            name: t('partnership.banner.sidebar'),
            size: '300x250px',
            image: '/banners/banner-300x250.png',
            code: `<!-- Banner XZenPress 300x250 -->
<a href="https://xzenpress.com?ref=parceiro" target="_blank" rel="noopener">
  <img src="https://xzenpress.com/banners/banner-300x250.png" 
       alt="XZenPress Wellness - Bem-estar integrativo gratuito 24/7" 
       width="300" 
       height="250"
       style="border:none; display:block; border-radius:8px;">
</a>`
        },
        {
            id: '728x90',
            name: t('partnership.banner.leaderboard'),
            size: '728x90px',
            image: '/banners/banner-728x90.png',
            code: `<!-- Banner XZenPress 728x90 -->
<a href="https://xzenpress.com?ref=parceiro" target="_blank" rel="noopener">
  <img src="https://xzenpress.com/banners/banner-728x90.png" 
       alt="XZenPress - Acupressão MTC, Respiração 4-7-8, Cromoterapia" 
       width="728" 
       height="90"
       style="border:none; display:block;">
</a>`
        }
    ];

    const copyToClipboard = (code: string, bannerId: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(bannerId);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white z-10">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center space-x-3 mb-2">
                        <Share2 className="w-8 h-8" />
                        <h2 className="text-3xl font-bold">{t('partnership.title')}</h2>
                    </div>
                    <p className="text-white text-opacity-90 text-lg">
                        {t('partnership.subtitle')}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Benefits */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                        <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center">
                            <Globe className="w-6 h-6 mr-2 text-blue-600" />
                            {t('partnership.benefits.title')}
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{t('partnership.benefits.1')}</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{t('partnership.benefits.2')}</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{t('partnership.benefits.3')}</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{t('partnership.benefits.4')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Banners */}
                    <div>
                        <h3 className="font-bold text-xl text-gray-800 mb-4">
                            {t('partnership.banners.title')}
                        </h3>

                        <div className="space-y-6">
                            {banners.map((banner) => (
                                <div key={banner.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">

                                    {/* Banner Info */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="font-semibold text-lg text-gray-800">{banner.name}</h4>
                                            <p className="text-sm text-gray-500">{banner.size}</p>
                                        </div>
                                        <a
                                            href={banner.image}
                                            download
                                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span className="text-sm font-medium">{t('partnership.download')}</span>
                                        </a>
                                    </div>

                                    {/* Banner Preview */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-center">
                                        <img
                                            src={banner.image}
                                            alt={banner.name}
                                            className="max-w-full h-auto"
                                            style={{ maxHeight: '250px' }}
                                        />
                                    </div>

                                    {/* HTML Code */}
                                    <div className="bg-gray-900 rounded-lg p-4 relative">
                                        <pre className="text-sm text-gray-100 overflow-x-auto">
                                            <code>{banner.code}</code>
                                        </pre>
                                        <button
                                            onClick={() => copyToClipboard(banner.code, banner.id)}
                                            className="absolute top-2 right-2 px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-md transition-colors flex items-center space-x-2"
                                        >
                                            {copiedCode === banner.id ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span className="text-sm">{t('partnership.copied')}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    <span className="text-sm">{t('partnership.copy')}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
                        <h3 className="font-bold text-lg text-gray-800 mb-3">
                            {t('partnership.howto.title')}
                        </h3>
                        <ol className="space-y-2 text-gray-700">
                            <li className="flex items-start">
                                <span className="font-bold text-blue-600 mr-2">1.</span>
                                <span>{t('partnership.howto.step1')}</span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-bold text-blue-600 mr-2">2.</span>
                                <span>{t('partnership.howto.step2')}</span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-bold text-blue-600 mr-2">3.</span>
                                <span>{t('partnership.howto.step3')}</span>
                            </li>
                        </ol>
                    </div>

                    {/* Contact */}
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">
                            {t('partnership.contact.text')}
                        </p>
                        <a
                            href="mailto:aleksayevacupress@gmail.com"
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                        >
                            <span>{t('partnership.contact.button')}</span>
                        </a>
                    </div>

                </div>
            </div>
        </div>
    );
};
