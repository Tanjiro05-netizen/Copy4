import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { supabase } from '../supabaseClient';
import { Award, Check, X, Calendar, BookOpen, User } from 'lucide-react';

const CertificateVerifyPage = () => {
  const { certificateNumber } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    verifyCertificate();
  }, [certificateNumber]);

  const verifyCertificate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('stem_certificates')
        .select(`
          *,
          stem_courses(title, slug, stem_subjects(name, color)),
          profiles:user_id(display_name, email)
        `)
        .eq('certificate_number', certificateNumber)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError('Certificate not found');
        } else {
          throw fetchError;
        }
      } else {
        setCertificate(data);
      }
    } catch (err) {
      console.error('Error verifying certificate:', err);
      setError('Error verifying certificate');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#12131A]">
      <Header />
      <div className="pt-24 px-4 pb-12">
        <div className="container mx-auto max-w-2xl">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Verifying certificate...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-6">
                <X className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Certificate Not Found</h1>
              <p className="text-gray-400 mb-6">
                The certificate number "{certificateNumber}" could not be verified.
              </p>
              <Link 
                to="/science-tech"
                className="text-red-400 hover:text-red-300"
              >
                ← Back to courses
              </Link>
            </div>
          ) : certificate && (
            <div className="text-center">
              {/* Verified Badge */}
              <div className="w-24 h-24 rounded-full bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-green-500" />
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                Certificate Verified
              </h1>
              <p className="text-green-400 text-lg mb-8">
                This certificate is authentic and valid
              </p>

              {/* Certificate Details Card */}
              <div className="bg-black/40 rounded-xl border border-red-900/30 p-8 text-left">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Award className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Certificate of Completion</h2>
                    <p className="text-gray-500 font-mono text-sm">{certificate.certificate_number}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Recipient */}
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-sm">Awarded to</p>
                      <p className="text-white font-medium">
                        {certificate.profiles?.display_name || certificate.profiles?.email?.split('@')[0] || 'Student'}
                      </p>
                    </div>
                  </div>

                  {/* Course */}
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-sm">Course completed</p>
                      <p className="text-white font-medium">{certificate.stem_courses?.title}</p>
                      <p className="text-gray-400 text-sm">{certificate.stem_courses?.stem_subjects?.name}</p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-sm">Date issued</p>
                      <p className="text-white font-medium">{formatDate(certificate.issued_at)}</p>
                    </div>
                  </div>

                  {/* Score */}
                  {certificate.final_score && (
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-gray-500 text-sm">Final score</p>
                        <p className="text-green-400 font-medium">{certificate.final_score}%</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* View Course Button */}
                <div className="mt-8 pt-6 border-t border-gray-800">
                  <Link
                    to={`/science-tech/courses/${certificate.stem_courses?.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateVerifyPage;
