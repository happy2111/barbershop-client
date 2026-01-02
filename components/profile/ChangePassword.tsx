import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { profileService } from "@/services/profile.service";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react"; // Иконки
import { motion, AnimatePresence } from "framer-motion"; // Для анимации

const ChangePassword = () => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  // Состояния видимости паролей
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleVerifyOld = async () => {
    setLoading(true);
    try {
      await profileService.changePassword(oldPass);
      setIsValid(true);
      toast.success('Старый пароль верен. Теперь введите новый пароль.');
    } catch (e: any) {
      toast.error(e?.message || "Ошибка проверки пароля");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPass) return toast.error("Введите новый пароль");

    setLoading(true);
    try {
      await profileService.changePassword(oldPass, newPass);
      setIsValid(false);
      setNewPass("");
      setOldPass("");
      toast.success('Пароль успешно изменен.');
    } catch (e: any) {
      toast.error(e?.message || "Ошибка при смене пароля");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Изменить Пароль</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Поле старого пароля */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showOld ? "text" : "password"}
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              placeholder="Старый пароль"
              disabled={isValid}
              className={isValid ? "border-green-500 pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {isValid && (
              <CheckCircle2 className="absolute -right-7 top-1/2 -translate-y-1/2 text-green-500" size={20} />
            )}
          </div>

          {!isValid && (
            <Button
              className="w-full"
              disabled={loading || !oldPass}
              onClick={handleVerifyOld}
            >
              {loading ? 'Проверка...' : 'Проверить старый пароль'}
            </Button>
          )}
        </div>

        {/* Анимированное появление поля нового пароля */}
        <AnimatePresence>
          {isValid && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Новый пароль"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? 'Обновление...' : 'Сохранить новый пароль'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default ChangePassword;